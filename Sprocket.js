/**
 * Sprocket is a tiny modularization framework.
 * @type {Object}
 * @return {} returns nothing
 * @name Sprocket  
 * @namespace default
 */
(function() {
	'use strict';
	/** 
	 * A list of known signals
	 * @memberof default 
	 */
	var signalsList = {};	
	/** 
	 * A list of registered modules
	 * @memberof default 
	 */
	var modules = {};
	/** Project's base directory 
	 * @memberof default
	 */
	var baseDir = '';

	/**
	 * Initializes base directory
	 * @constructor
	 * @memberof default
	 */
	function Sprocket() {
		console.log('Sprocket vX.XX');

		var currentScript = document.querySelectorAll('script');
		currentScript = currentScript[currentScript.length - 1];
		if (exists(currentScript.dataset.baseDir)) {
			baseDir = currentScript.dataset.baseDir;
		}
	};

	/** 
	 * Verifies if the argument is a string
	 * @param {Object} obj
	 * @return {boolean} 
	 * @memberof default
	 */
	function isString(obj) {
		return (typeof obj === 'string');
	}

	/** 
	 * Verifies if the argument is a function
	 * @param {Object} obj
	 * @return {boolean} 
	 * @memberof default
	 */
	function isFunction(obj) {
		return (typeof obj === 'function');
	}

	/** 
	 * Verifies if the argument is an array
	 * @param {Object} obj
	 * @return {boolean} 
	 * @memberof default
	 */
	function isArray(obj) {
		return (obj instanceof Array);
	}

	/** 
	 * Verifies if the provided object exists
	 * @param {Object} obj
	 * @return {boolean} 
	 * @memberof default
	 */
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

	/**
	 * Registers a new signal callback. It can take several signals at once.
	 * Expects: [{ id: 'id', func: callback }, etc]
	 *
	 * @param {Object} signals A map of signals and the corresponding callbacks
	 * @return {}
	 * @memberof default
	 */
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

	/**
	 * Broadcasts a signal, along with the relevant data, to the registered listeners.
	 * 
	 * @param {string} signalId Signal identifier
	 * @param {Object} data Data related to the broadcasted signal
	 * @return {}
	 * @memberof default
	 */
	Sprocket.prototype.sendSignal = function(signalId, data) {
		if (typeof signalsList[signalId] === 'undefined') {
			console.warn('Sprocket: No one\'s listening for \'' + signalId + '\'...');
			return;
		}

		signalsList[signalId].forEach(function(func) {
			func(data);
		});
	};

	/**
	 * Loads the module your own logic depends on. The required module must be defined in a js file having the same name.
	 * 
	 * @param {string} module Module name
	 * @param {Object} callback Module loader
	 * @return {}
	 * @memberof default
	 */
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

	/**
	 * Calls the module your own logic depends on. The required module must have already been loaded.
	 *  
	 * @param {string} module Module name
	 * @param {Object} callback Module loader
	 * @return {}
	 * @throws Exception if the corresponding source file could not be found as <i>baseDir/module.js</i>
	 * @see Sprocket.require(module, callback)
	 * @memberof default
	 */
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

	/**
	 * Registers a new module by providing module id, a list of dependencies and an initializer.
	 * 
	 * @param {string} id Module id
	 * @param {Array} dependencies An array of module identifiers
	 * @param {Object} initialize Module initializer
	 * @return {}
	 * @memberof default
	 */
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

	/**
	 * Registers a new plugin by providing module id, a list of dependencies and an initializer.
	 * 
	 * @param {string} id Plugin id
	 * @param {Array} dependencies An array of module identifiers
	 * @param {Object} initialize Module initializer
	 * @return {}
	 * @memberof default
	 */	
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
