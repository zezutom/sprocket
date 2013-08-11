(function() {
	'use strict';

	var signalsList = {};
	var modules = {};
	var baseDir = '';

	function Sprocket() {
		console.log('Sprocket vX.XX');

		var currentScript = document.querySelectorAll('script');
		currentScript = currentScript[currentScript.length - 1];
		if (exists(currentScript.dataset.baseDir)) {
			baseDir = currentScript.dataset.baseDir;
		}
	};

	// Helpers
	function isString(obj) {
		return (typeof obj === 'string');
	}

	function isFunction(obj) {
		return (typeof obj === 'function');
	}

	function isArray(obj) {
		return (obj instanceof Array);
	}

	function exists(obj) {
		return (typeof obj !== 'undefined' && obj !== null);
	}

	function newModule(vals) {
		var data = {
			loading: false,
			loadingListeners: [],
			depsLoading: false,
			depsLoadingListeners: [],
			data: null
		};

		if (exists(vals)) {
			for (var t in vals) {
				if (!vals.hasOwnProperty(t)) {
					continue;
				}

				data[t] = vals[t];
			}
		}

		return data;
	}

	// Registers a new signal callback. Can take several signals at once.
	// Expects: [{ id: 'id', func: callback }, etc]
	Sprocket.prototype.registerSignals = function(signals) {
		if (!(signals instanceof Array)) {
			console.error('Sprocket: Expected array!', signals);
			return;
		}

		signals.forEach(function(signal) {
			if (!isString(signal.id)) {
				console.error('Sprocket: Missing or invalid \'.id\' for signal.');
				return;
			}

			if (!isFunction(signal.func)) {
				console.error('Sprocket: Missing or invalid \'.func\' for signal.');
				return;
			}

			if (!exists(signalsList[signal.id])) {
				signalsList[signal.id] = [];
			}

			signalsList[signal.id].push(signal.func);
		});
	};

	// Sends data to anyone who is listening.
	Sprocket.prototype.sendSignal = function(signalId, data) {
		if (typeof signalsList[signalId] === 'undefined') {
			console.warn('Sprocket: No one\'s listening for \'' + signalId + '\'...');
			return;
		}

		signalsList[signalId].forEach(function(func) {
			func(data);
		});
	};

	Sprocket.prototype.require = function(module, callback) {
		var doLoad = function(module, callback) {
			var moduleId, moduleFile;

			if (module.search(/^core\//) > -1) {
				moduleId = module;
				moduleFile = baseDir + module + '.js';
			} else {
				moduleId = module;
				moduleFile = module + '.js';
			}

			if (exists(modules[moduleId])) {
				if (modules[moduleId].loading) {
					modules[moduleId].loadingListeners.push(callback);
					return;
				}
				if (exists(callback)) {
					callback(modules[moduleId]);
				}
				return;
			}

			modules[moduleId] = (function(id, filePath, doneCB) {
				var head = document.querySelectorAll('head')[0];
				var script = document.createElement('script');

				script.addEventListener('load', function() {
					var module = modules[moduleId];
					if (!module.depsLoading) {
						module.loading = false;
						for (var t = 0; t < module.loadingListeners.length; t++) {
							module.loadingListeners[t](module);
						}
					}
				}, true);
				script.src = filePath;

				head.appendChild(script);

				return newModule({
					loading: true,
					loadingListeners: exists(doneCB) ? [doneCB] : []
				});
			}) (moduleId, moduleFile, callback);
		};

		if (isArray(module)) {
			(function(modules, doneCB) {
				var counter = 0;
				var moduleList = [];
				var callback = function(module) {
					counter++;
					moduleList.push(module.data);

					if (counter >= modules.length) {
						if (isFunction(doneCB)) {
							doneCB.apply(window.Sprocket, moduleList);
						}
					}
				};
				for (var t = 0; t < modules.length; t++) {
					doLoad(modules[t], callback);
				}
			})(module, callback);
		} else {
			doLoad(module, function(module) {
				if (isFunction(callback)) {
					callback.call(window.Sprocket, module.data);
				}
			});
		}
	};

	Sprocket.prototype.requireModule = function(module) {
		if (!exists(modules[module])) {
			console.error('Sprocket: module \'' + module + '\' does not exist.');
			return;
		}

		if (modules[module].loading) {
			console.warn('Sprocket: module \'' + module + '\' is not yet loaded.');
		}

		return modules[module].data;
	};

	Sprocket.prototype.registerModule = function(id, dependencies, initialize) {
		if (!isString(id)) {
			console.error('Sprocket: Invalid module id.');
			return;
		}

		if (!isFunction(initialize)) {
			console.error('Sprocket: Undefined or invalid module function.');
			return;
		}

		if (exists(modules[id]) && !modules[id].loading) {
			console.error('Sprocket: Namespace \'' + id + '\' already taken.');
			return;
		}

		if (!exists(modules[id])) {
			modules[id] = newModule();
		}

		if (isArray(dependencies) && dependencies.length > 0) {
			modules[id].depsLoading = true;
			this.require(dependencies, function() {
				modules[id].data = initialize.apply(this, arguments);

				modules[id].depsLoading = false;
				for (var t = 0; t < modules[id].loadingListeners.length; t++) {
					modules[id].loadingListeners[t](modules[id]);
				}
			});
		} else {
			modules[id].data = initialize() || null;
		}
	};

	Sprocket.prototype.registerPlugin = function(id, dependencies, initialize) {
		if (!isString(id)) {
			console.error('Sprocket: Invalid plugin id.');
			return;
		}

		if (!isFunction(initialize)) {
			console.error('Sprocket: Undefined or invalid plugin function.');
			return;
		}

		if (exists(this[id])) {
			console.error('Sprocket: Namespace \'' + id + '\' already taken.');
			return;
		}

		if (isArray(dependencies) && dependencies.length > 0) {
			this.require(dependencies, function() {
				this[id] = initialize.apply(this, arguments);
			});
		} else {
			this[id] = initialize();
		}
	};

	if (typeof window.Sprocket !== 'undefined') {
		console.error('Sprocket: already defined!!!');
		return;
	}
	window.Sprocket = new Sprocket();
})();
