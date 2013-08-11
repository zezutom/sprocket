Sprocket.registerPlugin('pingpong', ['ping', 'pong'], function() {
	'use strict';

	Sprocket.sendSignal('ping');
});
