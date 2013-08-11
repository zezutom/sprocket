Sprocket.registerPlugin('pingpong', ['ping', 'pong'], function() {
	'use strict';

	console.log(arguments);
	Sprocket.sendSignal('ping');
});
