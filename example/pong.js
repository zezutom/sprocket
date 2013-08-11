Sprocket.registerPlugin('pong', [], function() {
	'use strict';

	function pong() {
		console.log('pong!');
	}

	Sprocket.registerSignals([{ id: 'pong', func: pong }]);

	console.log('Ping: I\'m alive!');
});
