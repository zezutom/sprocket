(function() {
	'use strict';

	var signalsList = {};
	var plugins = {};

	function Sprocket() {
		console.log('Sprocket vX.XX');
	};

	// Helpers
	function isString(obj) {
		return (typeof obj === 'string');
	}

	function isFunction(obj) {
		return (typeof obj === 'function');
	}

	function exists(obj) {
		return (typeof obj !== 'undefined' && obj !== null);
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
		console.log('Signal sent', signalId);

		if (typeof signalsList[signalId] === 'undefined') {
			console.warn('Sprocket: No one\'s listening...');
			return;
		}

		signalsList[signalId].forEach(function(func) {
			func(data);
		});
	};

	Sprocket.prototype.loadPlugin = function(plugin, callback) {
		var pluginId, pluginFile;

		if (plugin.search(/\.js$/) > -1) {
			var matches = plugin.match(/.*\.js$/);

			if (matches) {
				pluginId = matches.pop();
				pluginFile = plugin;
			} else {
				console.error('Sprocket: Can\'t figure out what file to load for plugin \'' + plugin + '\'.');
				return;
			}
		} else {
			pluginId = plugin;
			pluginFile = plugin + '.js';
		}

		if (exists(plugins[pluginId])) {
			console.error('Sprocket: Can\'t load \'' + pluginId + '\', id taken.');
			return;
		}

		plugins[pluginId] = (function(id, filePath, doneCB) {
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');

			script.addEventListener('load', function() {
				if (exists(doneCB)) {
					doneCB(plugins[pluginId]);
				}
			}, true);
			script.src = filePath;

			head.appendChild(script);
		})(pluginId, pluginFile, callback);
	};

	Sprocket.prototype.requirePlugin = function(plugin) {
		if (!exists(plugins[plugin])) {
			console.error('Sprocket: Plugin \'' + plugin + '\' does not exist.');
			return;
		}

		return plugins[plugin];
	};

	Sprocket.prototype.registerPlugin = function(id, dependencies, initialize) {
		if (typeof id !== 'string') {
			console.error('Sprocket: Invalid id.');
			return;
		}

		if (typeof initialize !== 'function') {
			console.error('Sprocket: Undefined or invalid plugin function.');
			return;
		}

		if (typeof plugins[id] !== 'undefined') {
			console.error('Sprocket: Namespace \'' + id + '\' already taken.');
			return;
		}

		if (isArray(dependencies)) {
			console.log('deploading goes here');
		} else {
			plugins[id] = initialize() || [];
		}
	};

	if (typeof window.Sprocket !== 'undefined') {
		console.error('Sprocket: already defined!!!');
		return;
	}
	window.Sprocket = new Sprocket();
})();
