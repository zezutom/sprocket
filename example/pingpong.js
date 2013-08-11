Sprocket.registerPlugin('pingpong', [], function() {
	'use strict';

	function ping() {
		console.log('ping!');
		Sprocket.sendSignal('pong');
	}

	function pong() {
		console.log('pong!');
	}

	Sprocket.registerSignals([{ id: 'ping', func: ping}, { id: 'pong', func: pong }]);
});
