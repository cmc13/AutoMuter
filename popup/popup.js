ready(function () {
	var txtNewUrl = document.getElementById('txtNewUrl');
	var btnAddUrl = document.getElementById('btnAddUrl');

	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function (tabs) {
		if (tabs.length > 0) {
			txtNewUrl.value = tabs[0].url;

			if (validatePattern(tabs[0].url)) {
				txtNewUrl.style.backgroundColor = '';
				btnAddUrl.disabled = false;
			} else {
				txtNewUrl.style.backgroundColor = 'salmon';
				btnAddUrl.disabled = true;
			}
		}
	});

	txtNewUrl.oninput = function () {
		if (validatePattern(txtNewUrl.value.trim())) {
			txtNewUrl.style.backgroundColor = '';
			btnAddUrl.disabled = false;
		} else {
			txtNewUrl.style.backgroundColor = 'salmon';
			btnAddUrl.disabled = true;
		}
	};

	btnAddUrl.onclick = function () {
		loadSettings(function (settings) {
			var newUrl = txtNewUrl.value.trim();
			if (validatePattern(newUrl)) {
				newUrl = escapeURLPattern(txtNewUrl.value.trim());
				var contains = false;
				for (var i = 0; i < settings.urlPatterns.length && !contains; ++i) {
					if (settings.urlPatterns[i] === newUrl)
						contains = true;
				}
				if (!contains)
					settings.urlPatterns.push(escapeURLPattern(txtNewUrl.value));

				saveSettings(settings, function () {
					window.close();
				});
			} else {
				txtNewUrl.style.backgroundColor = 'salmon';
				btnAddUrl.disabled = true;
			}
		});
	};
});
