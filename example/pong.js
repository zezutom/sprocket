Sprocket.registerModule('pong', [], function() {
	'use strict';

	function pong() {
		console.log('pong!');
	}

	Sprocket.registerSignals([{ id: 'pong', func: pong }]);

	return {
		pong: true
	}
});
