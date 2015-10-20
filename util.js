function escapeURLPattern(pat) {
	return pat.replace('{', '%7B')
		.replace('}', '%7D')
		.replace('"', '%22')
		.replace('<', '%3C')
		.replace('>', '%3E')
		.replace('%', '%25')
		.replace(' ', '%20')
		.replace('|', '%7C')
		.replace('^', '%5E')
		.replace('~', '%7E')
		.replace('[', '%5B')
		.replace(']', '%5D')
		.replace('`', '%60');
}

function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

function parseQueryString(a) {
	if (!a)
		a = window.location.search.substr(1).split('&');

	if (a == "") return {};
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

function validatePattern(pat) {
	if (pat) {
		try {
			var up = new UrlPattern(escapeURLPattern(pat).replace(':', '\\:'));
			up.match('http://www.google.com');
			return true;
		} catch (e) {
			return false;
		}
	}

	return false;
}

function loadSettings(processSettings) {
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

function saveSettings(settings, cb) {
	chrome.storage.sync.set({ "settings": JSON.stringify(settings) }, function () {
		if (cb)
			cb();
	});
}
