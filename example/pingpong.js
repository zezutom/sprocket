Sprocket.registerModule('pingpong', ['ping', 'pong'], function(ping, pong) {
	'use strict';

	return function() {
		Sprocket.sendSignal('ping');
	};
});
