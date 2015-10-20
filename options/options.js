ready(function () {
	var txtNewUrl = document.getElementById('txtNewUrl');
	var btnAddUrl = document.getElementById('btnAddUrl');
	var lstUrls = document.getElementById('lstUrls');
	var btnDeleteUrl = document.getElementById('btnDeleteUrl');
	var btnSave = document.getElementById('btnSave');
	var btnHelp = document.getElementById('btnHelp');

	// Load settings from Chrome storage
	loadSettings(function (settings) {
		for (var i = 0; i < settings.urlPatterns.length; ++i) {
			var opt = document.createElement('option');
			opt.text = settings.urlPatterns[i];
			opt.value = settings.urlPatterns[i];
			lstUrls.add(opt);
		}
	});

	// Check if input in new url textbox is a valid URL pattern.
	txtNewUrl.oninput = function () {
		var newUrl = txtNewUrl.value.trim();
		if (newUrl) {
			if (validatePattern(newUrl)) {
				txtNewUrl.style.backgroundColor = '';
				btnAddUrl.disabled = false;
			} else {
				txtNewUrl.style.backgroundColor = 'salmon';
				btnAddUrl.disabled = true;
			}
		} else {
			btnAddUrl.disabled = true;
		}
	};

	// Add the new URL to the list.
	btnAddUrl.onclick = function () {
		var newUrl = txtNewUrl.value.trim();
		if (newUrl) {
			var duplicate = false;
			for (var i = 0; i < lstUrls.options.length && !duplicate; ++i) {
				if (!newUrl.localeCompare(lstUrls.options[i].value))
					duplicate = true;
			}

			if (!duplicate) {
				var opt = document.createElement('option');
				opt.value = opt.text = escapeURLPattern(newUrl);
				lstUrls.add(opt);
			}

			txtNewUrl.value = '';
		}
		btnSave.disabled = false;
		btnAddUrl.disabled = true;
		txtNewUrl.focus();
	};

	lstUrls.onchange = function () {
		if (lstUrls.options[lstUrls.selectedIndex].value) {
			btnDeleteUrl.disabled = false;
		} else {
			btnDeleteUrl.disabled = true;
		}
	};

	btnDeleteUrl.onclick = function () {
		if (lstUrls.options[lstUrls.selectedIndex].value) {
			lstUrls.remove(lstUrls.selectedIndex);
		}
		btnDeleteUrl.disabled = true;
		btnSave.disabled = false;
	};

	btnSave.onclick = function () {
		// Get url patterns from listbox
		var urlPatterns = [];
		for (var i = 0; i < lstUrls.options.length; ++i) {
			urlPatterns.push(lstUrls.options[i].value);
		}

		saveSettings({ "urlPatterns": urlPatterns });

		btnSave.disabled = true;
	};

	var helpTab;
	btnHelp.onclick = function () {
		if (!helpTab) {
			chrome.tabs.create({
				url: 'options-help.html'
			}, function (tab) {
				helpTab = tab;

				// When help tab closes, then remove reference to it so we open a new one.
				chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
					if (helpTab && tabId === helpTab.id) {
						helpTab = null;
					}
				});
			});
		} else {
			// Help tab already exists and is open, focus it.
			chrome.tabs.update(helpTab.id, { selected: true });
		}
	};

	var qs = parseQueryString();
	if (qs && qs["newUrl"]) {
		txtNewUrl.value = qs["newUrl"];

		if (validatePattern(qs["newUrl"])) {
			txtNewUrl.style.backgroundColor = '';
			btnAddUrl.disabled = false;
		} else {
			txtNewUrl.style.backgroundColor = 'salmon';
			btnAddUrl.disabled = true;
		}
	}

	txtNewUrl.focus();
});
