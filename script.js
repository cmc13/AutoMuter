var urlPatterns = [];
var urlPatternsLoaded = false;

function globStringToRegex(str) {
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
function isMatchingUrl(url) {
	for (var i = 0; i < urlPatterns.length; ++i) {
		var up = new UrlPattern(urlPatterns[i].replace(':', '\\:'));
		if (up.match(url)) {
			return true;
		}	
	}
	return false;
}

// Mute (or unmute) a tab
function muteTab(tab, tabId) {
	var isMuted = false;

	if (typeof tab.muted !== 'undefined')
		isMuted = tab.muted;
	else if (typeof tab.mutedInfo !== 'undefined')
		isMuted = tab.mutedInfo.muted;

	if ((!isMuted && isMatchingUrl(tab.url))
		|| (isMuted && !isMatchingUrl(tab.url))) {
		chrome.tabs.update(tabId, {
			muted: !isMuted
		});
	}
}

// Try to mute a tab (wait until url patterns are loaded from storage).
function tryMuteTab(tab, tabId, mute) {
	var mutedCause = null;
	if (typeof tab.mutedCause !== 'undefined')
		mutedCause = tab.mutedCause;
	else if (typeof tab.mutedInfo !== 'undefined')
		mutedCause = tab.mutedInfo.reason;

	if (mutedCause !== "user") {
		if (!urlPatternsLoaded) {
			document.addEventListener('urlPatternsLoaded', function (e) { muteTab(tab, tabId); }, false);
		} else {
			muteTab(tab, tabId);
		}
	}
}

// Set up custom event for loading settings from storage since the storage API is asynchronous
var urlPatternsLoadedEvent;
if (window.CustomEvent) {
	urlPatternsLoadedEvent = new CustomEvent('urlPatternsLoaded');
} else {
	urlPatternsLoadedEvent = document.createEvent('Event');
	urlPatternsLoadedEvent.initEvent('urlPatternsLoaded', true, true);
}

// Reload settings if they change
chrome.storage.onChanged.addListener(function () {
	urlPatternsLoaded = false;
	loadSettings(function (settings) {
		urlPatterns = settings.urlPatterns;
		urlPatternsLoaded = true;
	});
});

// If tab was prefetched or instant, it gets replaced
chrome.tabs.onReplaced.addListener(function (newTabId, oldTabId) {
	chrome.tabs.get(newTabId, function (tab) {
		tryMuteTab(tab, newTabId);
	});
});

// Tab was navigated to new URL. Try to mute (if applicable).
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	// If tab isn't already muted and wasn't (un-)muted by a user, then mute it.
	// Likewise, if tab is muted and wasn't (un-)muted by a user, then un-mute it.
	tryMuteTab(tab, tabId);
});

// When extension is installed, create a new context menu
chrome.runtime.onInstalled.addListener(function () {
	chrome.contextMenus.create({
		"title": "Automute this page",
		"contexts": [ "all" ],
		"onclick": function (info, tab) {
			var url = chrome.runtime.getURL('options/options.html') + '?newUrl='
				+ encodeURIComponent(tab.url);
			chrome.tabs.create({ url: url });
		}
	});
});

loadSettings(function (settings) {
	urlPatterns = settings.urlPatterns;
	urlPatternsLoaded = true;
	document.dispatchEvent(urlPatternsLoadedEvent);
});
