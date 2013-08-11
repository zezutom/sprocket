Sprocket.registerPlugin('utils', [], function() {
	'use strict';

	return {
		each: function(data, item_callback) {
			if (typeof item_callback !== "function") {
				console.error("utils.each: Must provide callback function.");
				return;
			}

			if (data instanceof Array) {
				for (var t = 0; t < data.length; t++) {
					item_callback(t, data[t]);
				}
			} else if (typeof data === "object") {
				for (var t in data) {
					if (!data.hasOwnProperty(t)) {
						continue;
					}

					item_callback(t, data[t]);
				}
			}
		},

		limit: function(val, min, max) {
			if (min > max) {
				var tmp = max;
				max = min;
				min = tmp;
			}

			return Math.min(Math.max(parseInt(val, 10), parseInt(min, 10)), parseInt(max, 10));
		}
	}
});
