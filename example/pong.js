Sprocket.registerModule('pong', [], function() {
	'use strict';

	function pong() {
		console.log('pong!');
	}

	Sprocket.registerSignals([{ id: 'pong', func: pong }]);

	console.log('Pong: I\'m alive!');

	return {
		pong: true
	}
});
