(() => {
	const STORAGE_KEY = 'languageSwitch_scrollPosition';

	function getPathWithoutLang(url) {
		const path = url.pathname || url;
		return path.replace(/^\/(en|pt-br)\//, '/');
	}

	function storeScrollPosition() {
		const scrollY = window.scrollY || window.pageYOffset;
		const path = getPathWithoutLang(window.location);
		const lang = window.location.pathname.match(/^\/(en|pt-br)\//)?.[1] || 'en';

		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				path: path,
				scrollY: scrollY,
				sourceLang: lang,
				timestamp: Date.now(),
			}),
		);
	}

	function restoreScrollPosition() {
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (!stored) return;

		try {
			const data = JSON.parse(stored);
			const currentPath = getPathWithoutLang(window.location);

			if (data.path === currentPath && typeof data.scrollY === 'number') {
				setTimeout(() => {
					window.scrollTo(0, data.scrollY);
					sessionStorage.removeItem(STORAGE_KEY);
				}, 150);
			} else {
				sessionStorage.removeItem(STORAGE_KEY);
			}
		} catch (e) {
			console.error('Failed to restore scroll position:', e);
			sessionStorage.removeItem(STORAGE_KEY);
		}
	}

	function isLanguageSelector(element) {
		if (!element) return false;
		const className = element.className || '';
		const tagName = element.tagName || '';

		return (
			className.toLowerCase().includes('language') ||
			className.toLowerCase().includes('locale') ||
			element.getAttribute?.('data-lang') ||
			element.getAttribute?.('role') === 'combobox' ||
			(tagName === 'BUTTON' &&
				element.textContent?.toLowerCase().match(/^(en|pt-br|portugu|english)/))
		);
	}

	function interceptLanguageSwitch() {
		let lastClickTime = 0;
		const CLICK_THRESHOLD = 300;

		document.addEventListener('click', (e) => {
			const target = e.target;
			const currentTime = Date.now();

			if (currentTime - lastClickTime < CLICK_THRESHOLD) return;
			lastClickTime = currentTime;

			let element = target;
			let foundLanguageSelector = false;

			for (let i = 0; i < 5 && element; i++) {
				if (isLanguageSelector(element)) {
					foundLanguageSelector = true;
					break;
				}
				element = element.parentElement;
			}

			if (foundLanguageSelector) {
				setTimeout(storeScrollPosition, 10);
			}
		});

		document.addEventListener('beforeunload', () => {
			const scrollY = window.scrollY || window.pageYOffset;
			const path = getPathWithoutLang(window.location);
			sessionStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					path: path,
					scrollY: scrollY,
					timestamp: Date.now(),
				}),
			);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			interceptLanguageSwitch();
			restoreScrollPosition();
		});
	} else {
		interceptLanguageSwitch();
		restoreScrollPosition();
	}

	window.addEventListener('pageshow', (event) => {
		if (event.persisted) {
			restoreScrollPosition();
		}
	});
})();
