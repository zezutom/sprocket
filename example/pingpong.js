(function() {
	'use strict';

	function pingpong() {
		Sprocket.registerSignals([{ id: 'ping', func: ping}, { id: 'pong', func: pong }]);
	}

	function ping() {
		console.log('ping!');
		Sprocket.sendSignal('pong');
	}

	function pong() {
		console.log('pong!');
	}

	window.pingpong = new pingpong();
})();
