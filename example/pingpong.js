Sprocket.registerModule('pingpong', ['ping', 'pong'], function(ping, pong) {
	'use strict';

	console.log(ping, pong);
	Sprocket.sendSignal('ping');

	return {
		pingpong: true
	};
});
