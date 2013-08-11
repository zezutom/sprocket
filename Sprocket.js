(function() {
	'use strict';

	var signalsList = {};

	function Sprocket() {
		console.log('Sprocket vX.XX');
	};

	Sprocket.prototype.registerSignals = function(signals) {
		if (!(signals instanceof Array)) {
			console.error('Expected array!', signals);
			return;
		}

		signals.forEach(function(signal) {
			if (typeof signal.id !== 'string') {
				console.error('Sprocket: Missing or invalid \'.id\' for signal.');
				return;
			}

			if (typeof signal.func !== 'function') {
				console.error('Sprocket: Missing or invalid \'.func\' for signal.');
				return;
			}

			if (typeof signalsList[signal.id] === 'undefined') {
				signalsList[signal.id] = [];
			}

			signalsList[signal.id].push(signal.func);
		});
	};

	Sprocket.prototype.sendSignal = function(signalId, data) {
		console.log('Signal sent', signalId);

		if (typeof signalsList[signalId] === 'undefined') {
			console.warn('No one\'s listening...');
			return;
		}

		signalsList[signalId].forEach(function(func) {
			func(data);
		});
	};

	Sprocket.prototype.debugOut = function() {
		console.log(signalsList);
	};

	if (typeof window.Sprocket !== 'undefined') {
		console.error('Sprocket already defined!');
		return;
	}
	window.Sprocket = new Sprocket();
})();
