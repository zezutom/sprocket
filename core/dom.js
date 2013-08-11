Sprocket.registerModule('core/dom', [], function() {
	'use strict';

	var dom = function(query) {
		return new domNodeList(query);
	};

	// Ready event
	var domReadyFuncs = [];
	dom.ready = function(callback) {
		domReadyFuncs.push(callback);
	};
	var domReady = function() {
		if (domReadyFuncs.length > 0) {
			for (var t = 0; t < domReadyFuncs.length; t++) {
				domReadyFuncs[t]();
				delete domReadyFuncs[t];
			}

			domReadyFuncs = [];
		}

		document.removeEventListener('DOMContentLoaded', domReady, false);
	};
	document.addEventListener('DOMContentLoaded', domReady, false);

	// Node List
	var domNodeList = function(query) {
		var nodeList = [];
		if (typeof query !== 'undefined' && query.nodeType) {
			nodeList = [query];
		} else if (query instanceof Array) {
			nodeList = query;
		} else if (query instanceof domNodeList) {
			return query;
		} else if (typeof query === 'string') {
			var elemType = query.match(/^<(\w*)>$/);
			if (elemType && elemType.length > 1) {
				nodeList[0] = document.createElement(elemType[1]);
			} else {
				nodeList = document.querySelectorAll(query);
			}
		} else {
			console.warn('dom: Empty query.');
			this.length = 0;
			return this;
		}

		this.length = nodeList.length;
		for (var t = 0; t < nodeList.length; t++) {
			this[t] = nodeList[t];
		}

		return this;
	};

	domNodeList.prototype = {
		item: function(num) {
			if (num < 0 || num > this.length - 1) {
				console.error('dom.item: Index must be between 0 and ' + this.length + '.');
			}
			return dom(this[num]);
		},

		parent: function() {
			if (this.length > 0) {
				return dom(this[0].parentNode);
			}
			return this;
		},

		children: function(query) {
			var children = [];
			this.each(function() {
				if (typeof query !== 'undefined') {
					var subQuery = this.querySelectorAll(query);
					for (var t = 0; t < subQuery.length; t++) {
						children.push(subQuery.item(t));
					}
				} else {
					for (var t = 0; t < this.children.length; t++) {
						children.push(this.children.item(t));
					}
				}
			});
			return children.length > 0 ? dom(children) : new domNodeList();
		},

		each: function(callback) {
			for (var t = 0; t < this.length; t++) {
				callback.call(this[t]);
			}

			return this;
		},

		bind: function(type, callback) {
			return this.each(function() {
				this.addEventListener(type, callback, false);
			});
		},

		unbind: function(type, callback) {
			return this.each(function() {
				this.removeEventListener(type, callback, false);
			});
		},

		style: function(attrib, value) {
			if (typeof attrib === 'string' && typeof value === 'undefined') {
				return window.getComputedStyle(this[0], null).getPropertyValue(attrib);
			}

			var attribList = {};
			if (typeof attrib !== 'object') {
				attribList[attrib] = value;
			} else {
				attribList = attrib;
			}

			return this.each(function() {
				for (var t in attribList) {
					if (!attribList.hasOwnProperty(t)) {
						continue;
					}
					this.style[t] = attribList[t];
				}
			});
		},

		attr: function(attrib, value) {
			if (typeof attrib === 'string' && typeof value === 'undefined') {
				var result = this[0].attributes.getNamedItem(attrib);
				return result ? result.value : result;
			}

			var attribList = {};
			if (typeof attrib !== 'object') {
				attribList[attrib] = value;
			} else {
				attribList = attrib;
			}

			return this.each(function() {
				for (var t in attribList) {
					if (!attribList.hasOwnProperty(t)) {
						continue;
					}

					var domAttrib = document.createAttribute(t);
					domAttrib.nodeValue = attribList[t];
					this.attributes.setNamedItem(domAttrib);
				}
			});
		},

		addClass: function(classNames) {
			if (typeof classNames !== 'string') {
				console.error('dom.addClass: Argument must be string.');
				return this;
			}

			var classList = classNames.split(' ');
			return this.each(function() {
				for (var t = 0; t < classList.length; t++) {
					this.classList.add(classList[t]);
				}
			});
		},

		removeClass: function(classNames) {
			if (typeof classNames !== 'string') {
				console.error('dom.removeClass: Argument must be string.');
				return this;
			}

			var classList = classNames.split(' ');
			return this.each(function() {
				for (var t = 0; t < classList.length; t++) {
					this.classList.remove(classList[t]);
				}
			});
		},

		hasClass: function(className) {
			if (typeof className !== 'string') {
				console.error('dom.hasClass: Argument must be string.');
				return false;
			}

			if (className.split(' ').length > 1) {
				return false;
			}

			return this[0].classList.contains(className);
		},

		append: function(elemList) {
			elemList = dom(elemList);
			for (var t = 0; t < elemList.length; t++) {
				this[0].appendChild(elemList[t]);
			}

			return this;
		},

		appendTo: function(elem) {
			elem = dom(elem);
			for (var t = 0; t < this.length; t++) {
				elem[0].appendChild(this[t]);
			}

			return this;
		},

		prepend: function(elemList) {
			elemList = dom(elemList);
			var parent = this.parent();
			for (var t = 0; t < elemList.length; t++) {
				parent[0].insertBefore(elemList[t], this[0]);
			}

			return this;
		},

		prependTo: function(elem) {
			elem = dom(elem);
			for (var t = 0; t < this.length; t++) {
				elem[0].insertBefore(this[t], elem[0].children[0]);
			}

			return this;

		},

		text: function(text) {
			if (typeof text === 'undefined') {
				return this[0].textContent;
			}

			return this.each(function() {
				this.textContent = text;
			});
		},

		html: function(html) {
			if (typeof html === 'undefined') {
				return this[0].innerHTML;
			}

			return this.each(function() {
				this.innerHTML = html;
			});
		},

		value: function(value) {
			if (typeof value === 'undefined') {
				return this[0].value;
			}

			return this.each(function() {
				this.value = value;
			});
		},

		remove: function() {
			this.each(function() {
				dom(this).parent()[0].removeChild(this);
			});
		},

		empty: function() {
			this.each(function() {
				dom(this)[0].innerHTML = '';
			});
		}
	};

	return dom;
});
