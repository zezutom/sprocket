Sprocket.registerModule('ping', [], function() {
	'use strict';

	function ping() {
		console.log('ping!');
		Sprocket.sendSignal('pong');
	}

	Sprocket.registerSignals([{ id: 'ping', func: ping}]);

	return {
		ping: true
	}
});
