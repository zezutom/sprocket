Sprocket.registerPlugin('ping', [], function() {
	'use strict';

	function ping() {
		console.log('ping!');
		Sprocket.sendSignal('pong');
	}

	Sprocket.registerSignals([{ id: 'ping', func: ping}]);

	console.log('Ping: I\'m alive!');
});
