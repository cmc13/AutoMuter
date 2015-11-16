UTIL.ready(function () {
	var txtNewUrl = document.getElementById('txtNewUrl');
	var btnAddUrl = document.getElementById('btnAddUrl');

	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function (tabs) {
		if (tabs.length > 0) {
			txtNewUrl.value = tabs[0].url;

			if (UTIL.validatePattern(tabs[0].url)) {
				txtNewUrl.style.backgroundColor = '';
				btnAddUrl.disabled = false;
			} else {
				txtNewUrl.style.backgroundColor = 'salmon';
				btnAddUrl.disabled = true;
			}
		}
	});

	txtNewUrl.oninput = function () {
		if (UTIL.validatePattern(txtNewUrl.value.trim())) {
			txtNewUrl.style.backgroundColor = '';
			btnAddUrl.disabled = false;
		} else {
			txtNewUrl.style.backgroundColor = 'salmon';
			btnAddUrl.disabled = true;
		}
	};

	btnAddUrl.onclick = function () {
		UTIL.loadSettings(function (settings) {
			var newUrl = txtNewUrl.value.trim();
			if (UTIL.validatePattern(newUrl)) {
				newUrl = UTIL.escapeURLPattern(txtNewUrl.value.trim());
				var contains = false;
				for (var i = 0; i < settings.urlPatterns.length && !contains; ++i) {
					if (settings.urlPatterns[i] === newUrl)
						contains = true;
				}
				if (!contains)
					settings.urlPatterns.push(UTIL.escapeURLPattern(txtNewUrl.value));

				UTIL.saveSettings(settings, function () {
					window.close();
				});
			} else {
				txtNewUrl.style.backgroundColor = 'salmon';
				btnAddUrl.disabled = true;
			}
		});
	};
});
