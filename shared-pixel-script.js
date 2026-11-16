// =====================================================================
// SHARED PIXEL SCRIPT 2.1 -- Carrd book landing pages
//
// Load AFTER the page's own settings:
// <script src="https://cdn.jsdelivr.net/gh/pcawdron/carrdPixelLinks@main/shared-pixel-script.min.js"></script>
//
// PAGE SETTINGS (declare with `var` in the page <head>)
//   PIXEL_ID       Meta pixel ID                              required
//   BOOK_ASIN      ASIN of the book this page sells           required
//   BOOK_NAME      e.g. 'Anomaly'                             required
//   BOOK_PRICE     value sent with the checkout, in USD       optional
//   buyButtonTags  selectors for buy buttons, e.g.
//                  '#buttons01 a,#buttons02 a,#image05'       required
//                  (a selector may be the link itself or the element
//                  that contains it)
//
//   No longer used (harmless if still declared): SERIES_URL, bookTags,
//   reviewTags, seriesTags, BrowserBannerContainer, BrowserBannerDivider,
//   GOOGLE_*, UNKNOWN_SOURCE_ATTRIBUTION.
//
// WHAT IT DOES
//   1. Page load: Meta PageView + ViewContent. Every Amazon link on the
//      page is pointed at the visitor's local store, using the Amazon
//      Attribution link for that book + store when one exists, otherwise
//      the plain local store link. US prices in link text are swapped
//      for the local price.
//   2. Buy button tap: Meta InitiateCheckout (once per visit), Clarity
//      event 'buy_click', button label -> 'Opening Amazon...', then a
//      normal link navigation (keeps app deep linking working).
//   3. Any other link tap: Meta ViewContent for that link.
//   4. Coming back from Amazon: buy buttons are restored; Clarity event
//      'returned_from_amazon' tagged with how long they were away.
// =====================================================================
(function() {
    'use strict';
    console.log('Pixel script 2.2');

    // -----------------------------------------------------------------
    // SETTINGS -- read safely, so a missing one can never stop the script
    // -----------------------------------------------------------------
    function setting(name, fallback) {
        var v = window[name];
        return (v === undefined || v === null || v === '') ? fallback : v;
    }

    var PIXEL = setting('PIXEL_ID', '');
    var ASIN = String(setting('BOOK_ASIN', '')).toUpperCase();
    var NAME = setting('BOOK_NAME', ASIN);
    var PRICE = Number(setting('BOOK_PRICE', 0)) || 0;
    var BUY_SELECTORS = String(setting('buyButtonTags', ''))
        .split(',').map(function(s) { return s.trim(); }).filter(Boolean);

    if (!PIXEL) console.warn('PIXEL_ID is not set: Meta events will not be sent.');
    if (!ASIN) console.warn('BOOK_ASIN is not set.');
    if (!BUY_SELECTORS.length) console.warn('buyButtonTags is not set: no checkout tracking.');

    // -----------------------------------------------------------------
    // AMAZON ATTRIBUTION LINKS: ATTRIBUTION[ASIN][STORE] = full URL
    // A book/store with no entry gets the plain local store link.
    //
    // B005OJF0ZC = Anomaly
    // B0H67Q8TLR = First Contact Essentials
    // B01F02A89K = Welcome to the Occupied States
    // -----------------------------------------------------------------
    var ATTRIBUTION = {
        'B005OJF0ZC': {
            'CA': 'https://www.amazon.ca/Anomaly-Peter-Cawdron-ebook/dp/B005OJF0ZC?maas=maas_adg_6E578720CC269B44A82E85859F6495E1_afap_abs&ref_=aa_maas&tag=maas',
            'UK': 'https://www.amazon.co.uk/Anomaly-Peter-Cawdron-ebook/dp/B005OJF0ZC?maas=maas_adg_63C832220B6E6C8CE01BC9F816C037DB_afap_abs&ref_=aa_maas&tag=maas',
            'US': 'https://www.amazon.com/Anomaly-Peter-Cawdron-ebook/dp/B005OJF0ZC?maas=maas_adg_160906050429749715786E27B1BD104C_afap_abs&ref_=aa_maas&tag=maas'
        },
        'B0H67Q8TLR': {
            'CA': 'https://www.amazon.ca/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_5AB901ADD6DB6DE4CA98708F65C749B2_afap_abs&ref_=aa_maas&tag=maas',
            'UK': 'https://www.amazon.co.uk/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_9641E8F7CEE0D6FB5E928848D6A7037B_afap_abs&ref_=aa_maas&tag=maas',
            'US': 'https://www.amazon.com/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_3E73EEF03F4A0BD123F110B337F23339_afap_abs&ref_=aa_maas&tag=maas'
        },
        'B01F02A89K': {
            'CA': 'https://www.amazon.ca/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_31B3076DC198B8EE40A93F32DE12A180_afap_abs&ref_=aa_maas&tag=maas',
            'UK': 'https://www.amazon.co.uk/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_C70803F94FD0B011F3E8A13A7331FB02_afap_abs&ref_=aa_maas&tag=maas',
            'US': 'https://www.amazon.com/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_367871B70C394FD0C403F9ADF59F47D8_afap_abs&ref_=aa_maas&tag=maas'
        }
    };

    // -----------------------------------------------------------------
    // LOCAL PRICES: PRICES[ASIN][STORE] = price text.
    // 'US' must match the price written on the Carrd page; it is what
    // gets found and replaced. Remove this table to turn the feature off.
    // -----------------------------------------------------------------
    var PRICES = {
        'B005OJF0ZC': {
            'US': 'US 2.99', 'UK': '2.26 GBP', 'CA': '4.99 CAD', 'AU': '4.99 AUD',
            'DE': '2.99 EUR', 'FR': '2.99 EUR', 'ES': '2.99 EUR', 'IT': '2.99 EUR', 'NL': '2.99 EUR',
            'IN': '299 INR', 'JP': '499 JPY', 'BR': '15 BRL', 'MX': '49.99 MXN'
        },
        'B0H67Q8TLR': {
            'US': 'US 9.99', 'UK': '7.99 GBP', 'CA': '12.99 CAD', 'AU': '12.99 AUD',
            'DE': '8.99 EUR', 'FR': '8.99 EUR', 'ES': '8.99 EUR', 'IT': '8.99 EUR', 'NL': '8.99 EUR',
            'IN': '599 INR', 'JP': '1579 JPY', 'BR': '31.99 BRL', 'MX': '179 MXN'
        },
        'B01F02A89K': {
            'US': 'US 99c', 'UK': '0.99 GBP', 'CA': '1.49 CAD', 'AU': '1.99 AUD',
            'DE': '0.99 EUR', 'FR': '0.99 EUR', 'ES': '0.99 EUR', 'IT': '0.99 EUR', 'NL': '0.99 EUR',
            'IN': '96 INR', 'JP': '159 JPY', 'BR': '5.99 BRL', 'MX': '16.99 MXN'
        }
    };

    // -----------------------------------------------------------------
    // SMALL STORAGE HELPERS (some in-app browsers / private modes throw)
    // -----------------------------------------------------------------
    var memory = {};
    function store(kind) {
        try { return window[kind]; } catch (err) { return null; }
    }
    function getItem(kind, key) {
        try { var v = store(kind).getItem(key); if (v !== null) return v; } catch (err) {}
        return memory.hasOwnProperty(key) ? memory[key] : null;
    }
    function setItem(kind, key, value) {
        memory[key] = value;
        try { store(kind).setItem(key, value); } catch (err) {}
    }
    function removeItem(kind, key) {
        delete memory[key];
        try { store(kind).removeItem(key); } catch (err) {}
    }

    // -----------------------------------------------------------------
    // META PIXEL
    // -----------------------------------------------------------------
    var visitorId = getItem('localStorage', 'meta_external_id');
    if (!visitorId) {
        visitorId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        setItem('localStorage', 'meta_external_id', visitorId);
    }

    !function(f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    function pixel(eventName, params) {
        if (!PIXEL) return;
        try {
            window.fbq('track', eventName, params);
            console.log('Meta ' + eventName + ' sent', params);
        } catch (err) {
            console.error('Meta pixel error:', err);
        }
    }

    function clarityEvent(name, tagKey, tagValue) {
        try {
            if (typeof window.clarity !== 'function') return;
            if (tagKey) window.clarity('set', tagKey, tagValue);
            if (name) window.clarity('event', name);
        } catch (err) {}
    }

    if (PIXEL) {
        window.fbq('init', PIXEL, { external_id: visitorId });
        pixel('PageView', {});
        pixel('ViewContent', { content_ids: [ASIN], content_type: 'product', content_name: NAME });
    }

    // -----------------------------------------------------------------
    // VISITOR'S AMAZON STORE (time zone first, then browser language)
    // -----------------------------------------------------------------
    var DOMAINS = {
        US: 'www.amazon.com', CA: 'www.amazon.ca', MX: 'www.amazon.com.mx', BR: 'www.amazon.com.br',
        UK: 'www.amazon.co.uk', DE: 'www.amazon.de', FR: 'www.amazon.fr', ES: 'www.amazon.es',
        IT: 'www.amazon.it', NL: 'www.amazon.nl', BE: 'www.amazon.com.be', PL: 'www.amazon.pl',
        SE: 'www.amazon.se', TR: 'www.amazon.com.tr', AU: 'www.amazon.com.au', IN: 'www.amazon.in',
        JP: 'www.amazon.co.jp', SG: 'www.amazon.sg', AE: 'www.amazon.ae', SA: 'www.amazon.sa',
        EG: 'www.amazon.eg', ZA: 'www.amazon.co.za'
    };

    // Time zone prefixes (checked in order) -> store.
    var TIME_ZONES = [
        ['Australia/', 'AU'], ['Pacific/Auckland', 'AU'],
        ['Europe/London', 'UK'], ['Europe/Dublin', 'UK'],  // no Irish store; Irish Kindle buyers use .co.uk
        ['Europe/Berlin', 'DE'], ['Europe/Vienna', 'DE'], ['Europe/Paris', 'FR'],
        ['Europe/Madrid', 'ES'], ['Europe/Rome', 'IT'], ['Europe/Amsterdam', 'NL'],
        ['Europe/Brussels', 'BE'], ['Europe/Warsaw', 'PL'], ['Europe/Stockholm', 'SE'],
        ['Europe/Istanbul', 'TR'],
        ['America/Toronto', 'CA'], ['America/Vancouver', 'CA'], ['America/Montreal', 'CA'],
        ['America/Winnipeg', 'CA'], ['America/Edmonton', 'CA'], ['America/Halifax', 'CA'],
        ['America/St_Johns', 'CA'], ['America/Regina', 'CA'], ['America/Moncton', 'CA'],
        ['America/Whitehorse', 'CA'], ['America/Glace_Bay', 'CA'], ['America/Goose_Bay', 'CA'],
        ['America/Yellowknife', 'CA'], ['America/Iqaluit', 'CA'], ['America/Swift_Current', 'CA'],
        ['America/Dawson_Creek', 'CA'], ['America/Fort_Nelson', 'CA'],
        ['America/Mexico_City', 'MX'], ['America/Cancun', 'MX'], ['America/Monterrey', 'MX'],
        ['America/Merida', 'MX'], ['America/Chihuahua', 'MX'], ['America/Mazatlan', 'MX'],
        ['America/Tijuana', 'MX'],
        ['America/Sao_Paulo', 'BR'], ['America/Fortaleza', 'BR'], ['America/Recife', 'BR'],
        ['America/Bahia', 'BR'], ['America/Belem', 'BR'], ['America/Manaus', 'BR'],
        ['America/Cuiaba', 'BR'], ['America/Porto_Velho', 'BR'], ['America/Rio_Branco', 'BR'],
        ['Asia/Kolkata', 'IN'], ['Asia/Calcutta', 'IN'], ['Asia/Tokyo', 'JP'],
        ['Asia/Singapore', 'SG'], ['Asia/Dubai', 'AE'], ['Asia/Riyadh', 'SA'],
        ['Africa/Cairo', 'EG'], ['Africa/Johannesburg', 'ZA']
    ];

    var LANGUAGES = {
        'en-au': 'AU', 'en-gb': 'UK', 'en-ie': 'UK', 'en-ca': 'CA', 'fr-ca': 'CA',
        'es-mx': 'MX', 'pt-br': 'BR', 'de': 'DE', 'de-de': 'DE', 'de-at': 'DE', 'de-ch': 'DE',
        'fr': 'FR', 'fr-fr': 'FR', 'fr-be': 'FR', 'es': 'ES', 'es-es': 'ES', 'it': 'IT',
        'it-it': 'IT', 'nl': 'NL', 'nl-nl': 'NL', 'nl-be': 'NL', 'pl': 'PL', 'pl-pl': 'PL',
        'sv': 'SE', 'sv-se': 'SE', 'tr': 'TR', 'tr-tr': 'TR', 'hi': 'IN', 'hi-in': 'IN',
        'ja': 'JP', 'ja-jp': 'JP', 'zh-sg': 'SG', 'en-sg': 'SG', 'ar-ae': 'AE',
        'ar-sa': 'SA', 'ar-eg': 'EG', 'en-za': 'ZA'
    };

    function detectStore() {
        var tz = '';
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) {}
        for (var i = 0; i < TIME_ZONES.length; i++) {
            if (tz.indexOf(TIME_ZONES[i][0]) === 0) return TIME_ZONES[i][1];
        }
        var lang = (navigator.language || '').toLowerCase();
        return LANGUAGES[lang] || 'US';
    }

    var STORE = detectStore();
    console.log('Visitor store:', STORE);
    clarityEvent(null, 'marketplace', STORE);

    // -----------------------------------------------------------------
    // LINK LOCALIZATION
    // -----------------------------------------------------------------
    var ASIN_IN_URL = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|[?&#]|$)/i;

    function linkAsin(a) {
        if (a.dataset.asin) return a.dataset.asin;
        var m = (a.getAttribute('href') || '').match(ASIN_IN_URL);
        return m ? m[1].toUpperCase() : null;
    }

    // '/Book-Title/' part of an attribution URL, so plain links look like
    // Amazon's own canonical '/Book-Title/dp/ASIN/' form.
    function titleSlug(asin) {
        var urls = ATTRIBUTION[asin] || {};
        for (var code in urls) {
            var m = urls[code].match(/^https:\/\/[^/]+\/([^/]+)\/dp\//i);
            if (m) return m[1] + '/';
        }
        return '';
    }

    function localUrl(asin) {
        var tagged = ATTRIBUTION[asin] && ATTRIBUTION[asin][STORE];
        if (tagged) return tagged;
        return 'https://' + (DOMAINS[STORE] || DOMAINS.US) + '/' + titleSlug(asin) + 'dp/' + asin + '/';
    }

    // Swap the US price in the link's text for the local one. Matches the
    // US number with an optional 'US', 'US$' or '$' before it and 'USD',
    // 'c', '¢' or 'cents' after it. Numbers that are part of a bigger one
    // ('9.99' in '19.99') are left alone, and a whole number like 99 is
    // only replaced when it carries a price marker ('99c', '$99').
    function localizePrice(a, asin) {
        var prices = PRICES[asin];
        if (STORE === 'US' || !prices || !prices.US || !prices[STORE]) return;
        var num = (prices.US.match(/[0-9]+(?:\.[0-9]+)?/) || [])[0];
        if (!num) return;
        var re = new RegExp('(US\\s*\\$?\\s*|\\$\\s*)?' + num.replace(/\./g, '\\.') +
            '(\\s*USD|\\s*\\u00A2|\\s*cents?(?![A-Za-z])|c(?![A-Za-z]))?', 'g');

        var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walker.nextNode())) {
            node.nodeValue = node.nodeValue.replace(re, function(match, pre, suf, at, text) {
                var before = at > 0 ? text.charAt(at - 1) : '';
                var after = text.charAt(at + match.length);
                if (num.indexOf('.') === -1 && !pre && !suf) return match;
                if (!pre && /[0-9.]/.test(before)) return match;
                if (/[0-9]/.test(after)) return match;
                return (/[A-Za-z0-9]/.test(before) ? ' ' : '') + prices[STORE];
            });
        }
    }

    function localizeLink(a) {
        var asin = linkAsin(a);
        if (!asin) return null;
        a.dataset.asin = asin;              // survives the href being rewritten
        a.setAttribute('href', localUrl(asin));
        if (!a.dataset.vcPriceDone) {
            a.dataset.vcPriceDone = '1';
            localizePrice(a, asin);
        }
        return asin;
    }

    function localizeAllLinks() {
        document.querySelectorAll('a[href*="amazon" i]').forEach(localizeLink);
    }

    // -----------------------------------------------------------------
    // BUY BUTTONS
    // -----------------------------------------------------------------
    function isBuyLink(a) {
        for (var i = 0; i < BUY_SELECTORS.length; i++) {
            try {
                if (a.matches(BUY_SELECTORS[i]) || a.closest(BUY_SELECTORS[i])) return true;
            } catch (err) {
                console.warn('Invalid buy button selector:', BUY_SELECTORS[i]);
            }
        }
        return false;
    }

    var CHECKOUT_KEY = 'vc_checkout_' + ASIN;
    var LEFT_AT_KEY = 'vc_left_for_amazon';
    var busyLinks = [];

    function showOpening(a) {
        var label = a.querySelector('.label');
        if (label && !a.dataset.vcLabel) a.dataset.vcLabel = label.textContent;
        if (label) label.textContent = 'Opening Amazon...';
        a.style.opacity = '0.6';
        a.style.pointerEvents = 'none';     // stops double taps
        busyLinks.push(a);
    }

    function restoreButtons() {
        busyLinks.forEach(function(a) {
            var label = a.querySelector('.label');
            if (label && a.dataset.vcLabel) label.textContent = a.dataset.vcLabel;
            a.style.opacity = '';
            a.style.pointerEvents = '';
        });
        busyLinks = [];
    }

    function onBuyClick(a) {
        var asin = localizeLink(a) || ASIN;   // make sure the href is right at the moment of the tap
        console.log('Buy tapped ->', a.href);

        if (getItem('sessionStorage', CHECKOUT_KEY) !== '1') {
            setItem('sessionStorage', CHECKOUT_KEY, '1');
            pixel('InitiateCheckout', {
                content_ids: [asin], content_type: 'product', content_name: NAME,
                content_category: 'Book', value: PRICE, currency: 'USD'
            });
        } else {
            console.log('Checkout already counted this visit');
        }

        clarityEvent('buy_click');
        setItem('sessionStorage', LEFT_AT_KEY, String(Date.now()));
        showOpening(a);

        // If the page is still showing 10s later, navigation probably
        // didn't happen: give the button back and note it in Clarity.
        // (Facebook's in-app browser keeps this page on screen until
        // Amazon's page starts arriving, which on mobile data can take
        // several seconds -- a shorter wait mistakes a slow load for a
        // stall and invites a second tap that restarts the load.)
        setTimeout(function() {
            if (document.visibilityState === 'visible' && busyLinks.length) {
                clarityEvent('nav_stalled');
                restoreButtons();
            }
        }, 10000);
    }

    // -----------------------------------------------------------------
    // RETURNING FROM AMAZON (app switch back, Back button, or reload)
    // -----------------------------------------------------------------
    function awayBucket(s) {
        return s < 10 ? 'under 10s' : s < 30 ? '10-30s' : s < 120 ? '30s-2m' : s < 600 ? '2-10m' : 'over 10m';
    }

    function checkReturned() {
        var leftAt = parseInt(getItem('sessionStorage', LEFT_AT_KEY), 10);
        if (!leftAt) return;
        var seconds = Math.round((Date.now() - leftAt) / 1000);
        if (seconds < 2) return;            // the moment between the tap and leaving
        removeItem('sessionStorage', LEFT_AT_KEY);
        restoreButtons();
        if (seconds <= 3600) clarityEvent('returned_from_amazon', 'amazon_away', awayBucket(seconds));
    }

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') checkReturned();
    });
    window.addEventListener('pageshow', function() { checkReturned(); });

    // -----------------------------------------------------------------
    // ONE CLICK HANDLER FOR THE WHOLE PAGE
    // Capture phase, so it runs even if Carrd stops the click bubbling.
    // Never cancels the click: the browser follows the link natively,
    // which keeps Universal Links / App Links (Amazon & Kindle apps)
    // working.
    // -----------------------------------------------------------------
    document.addEventListener('click', function(e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;

        if (isBuyLink(a)) {
            onBuyClick(a);
            return;
        }

        var asin = /amazon\./i.test(a.hostname) ? localizeLink(a) : null;
        pixel('ViewContent', asin
            ? { content_ids: [asin], content_type: 'product', content_name: a.textContent.trim().slice(0, 100) || asin }
            : { content_name: (a.textContent.trim() || a.getAttribute('href')).slice(0, 100), content_category: 'Link' });
    }, true);

    // -----------------------------------------------------------------
    // START
    // -----------------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', localizeAllLinks);
    } else {
        localizeAllLinks();
    }
    window.addEventListener('load', localizeAllLinks);   // catches anything added late
})();
