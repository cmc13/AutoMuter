(function () {
	var urlPatterns = [];
	var settingsLoaded = false;

	// Mute (or unmute) a tab
	function toggleMute(tab, tabId) {
		var isMuted = false;

		// Chrome's muted API changed in v46
		if (typeof tab.muted !== 'undefined') // v < 46
			isMuted = tab.muted;
		else if (typeof tab.mutedInfo !== 'undefined') // v >= 46
			isMuted = tab.mutedInfo.muted;

		if (isMuted !== UTIL.isMatchingUrl(urlPatterns, tab.url)) {
			// Flip current muted state
			chrome.tabs.update(tabId, { muted: !isMuted });
		}
	}

	// Try to mute a tab (wait until url patterns are loaded from storage).
	function tryMuteTab(tab, tabId) {
		var mutedCause = null;

		// Chrome's muted API changed in v46
		if (typeof tab.mutedCause !== 'undefined') // v < 46
			mutedCause = tab.mutedCause;
		else if (typeof tab.mutedInfo !== 'undefined') // v >= 46
			mutedCause = tab.mutedInfo.reason;

		// Don't change current muted state if it was modified by user
		if (mutedCause !== "user") {
			if (!settingsLoaded) {
				document.addEventListener('settingsLoaded', function f() {
					toggleMute(tab, tabId);
					document.removeEventListener('settingsLoaded', f, false);
				}, false);
			} else {
				toggleMute(tab, tabId);
			}
		}
	}

	// Reload settings from chrome storage
	function reloadSettings() {
		settingsLoaded = false;
		UTIL.loadSettings(function (settings) {
			urlPatterns = settings.urlPatterns;
			settingsLoaded = true;
			document.dispatchEvent(settingsLoadedEvent);
		});
	};

	// Set up custom event for loading settings from storage since the storage API is asynchronous
	var settingsLoadedEvent;
	if (window.CustomEvent) {
		settingsLoadedEvent = new CustomEvent('settingsLoaded');
	} else {
		settingsLoadedEvent = document.createEvent('Event');
		settingsLoadedEvent.initEvent('settingsLoaded', true, true);
	}

	// Reload settings if they change
	chrome.storage.onChanged.addListener(reloadSettings);

	// If tab was prefetched or instant, it gets replaced rather than updated
	chrome.tabs.onReplaced.addListener(function (newTabId, oldTabId) {
		chrome.tabs.get(newTabId, function (tab) {
			tryMuteTab(tab, newTabId);
		});
	});

	// Tab was navigated to new URL. Try to mute (if applicable).
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		tryMuteTab(tab, tabId);
	});

	// When extension is installed, create a new context menu
	chrome.runtime.onInstalled.addListener(function () {
		chrome.contextMenus.create({
			"title": "AutoMute this page",
			"contexts": [ "all" ],
			"onclick": function (info, tab) {
				var url = chrome.runtime.getURL('options/options.html') + '?newUrl='
					+ encodeURIComponent(tab.url);
				chrome.tabs.create({ url: url });
			}
		});
	});

	// Initialize extension
	reloadSettings();
}());
