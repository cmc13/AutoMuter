var UTIL = (function () {
	var self = {};

	self.escapeURLPattern = function (pat) {
		return pat.replace(/[\[\]{}<>"% |^~`]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16);
		});
	}

	self.ready = function (fn) {
		if (document.readyState != 'loading'){
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	}

	self.parseQueryString = function (a) {
		if (!a)
			a = window.location.search.substr(1).split('&');

		var b = {};
		for (var i = 0; i < a.length; ++i)
		{
			var p=a[i].split('=', 2);
			if (p.length == 1)
				b[p[0]] = "";
			else
				b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
		}
		return b;
	}

	self.validatePattern = function (pat) {
		if (pat) {
			try {
				var up = new UrlPattern(self.escapeURLPattern(pat).replace(':', '\\:'));
				up.match('http://www.google.com');
				return true;
			} catch (e) {
				return false;
			}
		}

		return false;
	}

	self.loadSettings = function (processSettings) {
		chrome.storage.sync.get("settings", function (items) {
			var settings;
			if (typeof items.settings !== 'undefined') {
				settings = JSON.parse(items.settings);
			} else {
				settings = {
					"urlPatterns": []
				};
			}

			processSettings(settings);
		});
	}

	self.saveSettings = function (settings, cb) {
		chrome.storage.sync.set({ "settings": JSON.stringify(settings) }, function () {
			if (cb)
				cb();
		});
	}

	// Convert wildcard type string to regular expression
	// Code shamelessly stolen from http://stackoverflow.com/questions/13818186/converting-shell-wildcards-to-regex
	self.globStringToRegex = function (str) {
	    return new RegExp(preg_quote(str).replace(/\\\*/g, '.*').replace(/\\\?/g, '.'), 'g');
	}

	function preg_quote (str, delimiter) {
	    // http://kevin.vanzonneveld.net
	    // +   original by: booeyOH
	    // +   improved by: Ates Goral (http://magnetiq.com)
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +   bugfixed by: Onno Marsman
	    // +   improved by: Brett Zamir (http://brett-zamir.me)
	    // *     example 1: preg_quote("$40");
	    // *     returns 1: '\$40'
	    // *     example 2: preg_quote("*RRRING* Hello?");
	    // *     returns 2: '\*RRRING\* Hello\?'
	    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
	    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
	    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
	}

	// Return true if url matches any pattern in list. Return false, otherwise.
	self.isMatchingUrl = function (urlPatterns, url) {
		for (var i = 0; i < urlPatterns.length; ++i) {
			var up = new UrlPattern(urlPatterns[i].replace(':', '\\:'));
			if (up.match(url)) {
				return true;
			}	
		}
		return false;
	}

	return self;
}());
