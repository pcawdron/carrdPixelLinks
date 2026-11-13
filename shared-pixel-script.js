// =====================================================================
// SHARED SCRIPT -- host this file on GitHub, reference it via a CDN
// (see deployment notes) from each Carrd page, AFTER that page's own
// local configuration variables have been declared.
//
// REQUIRED per-page variables (declared with `var` in the page <head>):
//   PIXEL_ID, BOOK_NAME, BOOK_PRICE, BOOK_ASIN, SERIES_URL,
//   bookTags, reviewTags, seriesTags, buyButtonTags
//
// OPTIONAL per-page variables (pages that omit them behave as before):
//   UNKNOWN_SOURCE_ATTRIBUTION    'meta' (default) or 'none'
//                                 Visitors not identified as coming from
//                                 Meta get the Meta attribution link
//                                 ('meta') or a plain store link ('none').
//
// No longer used (safe to leave declared on a page, or delete):
//   BrowserBannerContainer, BrowserBannerDivider,
//   GOOGLE_ADS_ID, GOOGLE_BEGIN_CHECKOUT_LABEL, GOOGLE_NAV_MODE
//
// <script src="https://cdn.jsdelivr.net/gh/pcawdron/carrdPixelLinks@main/shared-pixel-script.min.js"></script>
//
// CHANGES IN 1.12
//   - Google Ads removed: no gtag.js, no begin_checkout conversion, no
//     Google attribution links, no 'callback' navigation mode.
//   - "Open in browser" banner removed (BrowserBannerContainer /
//     BrowserBannerDivider are no longer read). Delete the banner
//     element from each Carrd page, or set it hidden by default.
//   - The Meta pixel now loads for every visitor.
//   - InitiateCheckout now carries content_ids / content_type, matching
//     ViewContent, so Meta can tie the two events to the same book.
//   - More Canadian time zones recognised (Regina, Moncton, Whitehorse...).
//
// EARLIER
//   1.11  Cents prices ('US 99c') replaced whole.
//   1.09  Local store prices swapped into Amazon link/button text.
//   1.08  Checkout fires once per visit per book; Clarity
//         'returned_from_amazon' event and 'amazon_away' tag.
//   1.07  Canonical '/Title/dp/ASIN' fallback links; links localized on
//         DOM ready; buy button re-localizes at click; Ireland -> .co.uk.
// =====================================================================
console.log('Pixel script 1.12');

var TRACKED_ATTR = 'data-vc-tracked';

// =====================================================================
// OPTIONAL CONFIG (safe when a page has not declared these)
// =====================================================================
function optionalConfig(name, fallback) {
    var v = window[name];
    return (typeof v === 'undefined' || v === null || v === '') ? fallback : v;
}

var unknownSourceAttribution = optionalConfig('UNKNOWN_SOURCE_ATTRIBUTION', 'meta');

// =====================================================================
// TRAFFIC SOURCE DETECTION
//
// Returns 'meta' or 'other'. Evidence, in order:
//   1. Explicit utm_source (set by you in the ad's URL parameters)
//   2. fbclid, which Meta adds to ad clicks itself
//   3. Running inside Facebook/Instagram's in-app browser
// =====================================================================
function isMetaInAppBrowser() {
    var ua = navigator.userAgent || navigator.vendor || window.opera || '';
    return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram/i.test(ua);
}

function detectTrafficSource() {
    try {
        var params = new URLSearchParams(window.location.search);
        var utm = (params.get('utm_source') || '').toLowerCase();
        if (['facebook', 'fb', 'instagram', 'ig', 'meta', 'threads'].indexOf(utm) !== -1) return 'meta';
        if (params.has('fbclid')) return 'meta';
    } catch (err) {}

    if (isMetaInAppBrowser()) return 'meta';
    return 'other';
}

var TRAFFIC_SOURCE = detectTrafficSource();
console.log('Traffic source detected:', TRAFFIC_SOURCE);

// =====================================================================
// VISITOR EXTERNAL ID
// (wrapped in try/catch: some in-app browsers / private modes throw)
// =====================================================================
var externalId = null;
try {
    externalId = localStorage.getItem('meta_external_id');
    if (!externalId) {
        externalId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        localStorage.setItem('meta_external_id', externalId);
    }
} catch (err) {
    externalId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
}

// =====================================================================
// META PIXEL BASE CODE
// =====================================================================
!function(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
        n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
}(window, document, 'script',
    'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', PIXEL_ID, { external_id: externalId });
fbq('track', 'PageView');

fbq('track', 'ViewContent', {
    content_ids: [BOOK_ASIN],
    content_type: 'product',
    content_name: BOOK_NAME
});

// =====================================================================
// CHECKOUT-INITIATED EVENT
// =====================================================================
function trackInitiateCheckout() {
    console.log('...trying InitiateCheckout pixel');
    try {
        if (typeof fbq === 'function') {
            fbq('track', 'InitiateCheckout', {
                content_ids: [BOOK_ASIN],
                content_type: 'product',
                content_name: BOOK_NAME,
                content_category: 'Book',
                value: BOOK_PRICE,
                currency: 'USD'
            });
            console.log('...InitiateCheckout pixel sent');
        } else {
            console.log('...InitiateCheckout pixel NOT SENT');
        }
    } catch (err) {
        console.error('Meta Pixel error:', err);
    }
}

// =====================================================================
// SESSION HELPERS (sessionStorage lasts for this browser tab only;
// wrapped in try/catch because some in-app browsers throw)
// =====================================================================
var memoryStore = {};

function sessionGet(key) {
    try {
        var v = sessionStorage.getItem(key);
        if (v !== null) return v;
    } catch (err) {}
    return memoryStore.hasOwnProperty(key) ? memoryStore[key] : null;
}

function sessionSet(key, value) {
    memoryStore[key] = value;
    try { sessionStorage.setItem(key, value); } catch (err) {}
}

function sessionRemove(key) {
    delete memoryStore[key];
    try { sessionStorage.removeItem(key); } catch (err) {}
}

// =====================================================================
// CHECKOUT: ONCE PER VISIT
// The first buy tap in this tab sends the checkout event; later taps
// (double taps, coming back and tapping again) still go to Amazon but
// are not counted again.
// =====================================================================
var CHECKOUT_SENT_KEY = 'vc_checkout_sent_' + BOOK_ASIN;

function checkoutAlreadySent() {
    return sessionGet(CHECKOUT_SENT_KEY) === '1';
}

function markCheckoutSent() {
    sessionSet(CHECKOUT_SENT_KEY, '1');
}

// =====================================================================
// RETURNED FROM AMAZON
// When the buy button is tapped we note the time. If the visitor is
// later back looking at this page, we send the Clarity smart event
// 'returned_from_amazon' and tag the session with how long they were
// away. Covers all three ways of coming back:
//   - the tab becomes visible again (e.g. back from the Amazon app),
//   - the page is restored from the back/forward cache,
//   - the page is reloaded fresh in the same tab.
// =====================================================================
var AMAZON_LEFT_AT_KEY = 'vc_amazon_left_at';

function markLeftForAmazon() {
    sessionSet(AMAZON_LEFT_AT_KEY, String(Date.now()));
}

function awayBucket(seconds) {
    if (seconds < 10) return 'under 10s';
    if (seconds < 30) return '10-30s';
    if (seconds < 120) return '30s-2m';
    if (seconds < 600) return '2-10m';
    return 'over 10m';
}

function checkReturnedFromAmazon() {
    var leftAt = parseInt(sessionGet(AMAZON_LEFT_AT_KEY), 10);
    if (!leftAt) return false;
    var seconds = Math.round((Date.now() - leftAt) / 1000);
    // Ignore the brief moment between the tap and the page going away.
    if (seconds < 2) return false;
    sessionRemove(AMAZON_LEFT_AT_KEY);
    // Only count returns within an hour of the tap.
    if (seconds > 3600) return false;

    var bucket = awayBucket(seconds);
    console.log('Returned from Amazon after ' + seconds + 's (' + bucket + ')');
    if (typeof clarity === 'function') {
        clarity('set', 'amazon_away', bucket);
        clarity('event', 'returned_from_amazon');
    }
    return true;
}

// =====================================================================
// SELECTOR HELPER
// =====================================================================
function normalizeSelectorList(value) {
    if (Array.isArray(value)) return value.map(function(s) {
        return s.trim();
    });
    return String(value).split(',').map(function(s) {
        return s.trim();
    }).filter(Boolean);
}

// =====================================================================
// AMAZON MARKETPLACE ATTRIBUTION DATA (Meta traffic)
// Structure: AMAZON_ATTRIBUTION[ASIN][MARKETPLACE_CODE] = full URL
// An ASIN/store with no entry gets the plain local store link.
// =====================================================================
var AMAZON_ATTRIBUTION = {
    'B01F02A89K': {
        'CA': 'https://www.amazon.ca/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_3648D3D8A4FDADDB6BE14505B1A50076_afap_abs&ref_=aa_maas&tag=maas',
        'UK': 'https://www.amazon.co.uk/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_ABCB20D2239FB50EB2B89BABC116F08C_afap_abs&ref_=aa_maas&tag=maas',
        'US': 'https://www.amazon.com/Welcome-Occupied-States-America-Cawdron-ebook/dp/B01F02A89K?maas=maas_adg_275AB24A74C98F7D7068633CD68CF999_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B09F5RGX27': {
        'CA': 'https://www.amazon.ca/Cold-First-Contact-Peter-Cawdron-ebook/dp/B09F5RGX27?maas=maas_adg_DC06C0978EDBE8B8DDEE6BB258963F75_afap_abs&ref_=aa_maas&tag=maas',
        'UK': 'https://www.amazon.co.uk/Cold-First-Contact-Peter-Cawdron-ebook/dp/B09F5RGX27?maas=maas_adg_092EDCC339AC7ABA5434055C1ED10DA2_afap_abs&ref_=aa_maas&tag=maas',
        'US': 'https://www.amazon.com/Cold-First-Contact-Peter-Cawdron-ebook/dp/B09F5RGX27?maas=maas_adg_A810E977440C277816C00BC4928972A7_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0CYH2F9Y4': {
        'CA': 'https://www.amazon.ca/Darkness-Between-Stars-First-Contact-ebook/dp/B0CYH2F9Y4?maas=maas_adg_AD0DD3B91C94C133F49DA980230679C0_afap_abs&ref_=aa_maas&tag=maas',
        'UK': 'https://www.amazon.co.uk/Darkness-Between-Stars-First-Contact-ebook/dp/B0CYH2F9Y4?maas=maas_adg_25D95F626B627517E13E5F7C5231EF51_afap_abs&ref_=aa_maas&tag=maas',
        'US': 'https://www.amazon.com/Darkness-Between-Stars-First-Contact-ebook/dp/B0CYH2F9Y4?maas=maas_adg_3C95F8833CD6EB3204A03C3B55CD199D_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0FPK3RGRX': {
        'CA': 'https://www.amazon.ca/Oracle-First-Contact-Peter-Cawdron-ebook/dp/B0FPK3RGRX?maas=maas_adg_B2FEB002AF9FC6772D363BF4820AA4AA_afap_abs&ref_=aa_maas&tag=maas',
        'UK': 'https://www.amazon.co.uk/Oracle-First-Contact-Peter-Cawdron-ebook/dp/B0FPK3RGRX?maas=maas_adg_4503874AA8391D5CAF73406EF577D1D5_afap_abs&ref_=aa_maas&tag=maas',
        'US': 'https://www.amazon.com/Oracle-First-Contact-Peter-Cawdron-ebook/dp/B0FPK3RGRX?maas=maas_adg_EC9F0CE7E215B6F51AAC5E6BBDDE2C83_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0GX36QSG6': {
        'DE': 'https://www.amazon.de/Willkommen-besetzten-Staaten-Amerika-Kontakt-ebook/dp/B0GX36QSG6?maas=maas_adg_D99B8F6DEF99A57246F06B823887BDB7_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0H65ZBNYD': {
        'DE': 'https://www.amazon.de/Das-Simulakrum-Erster-Kontakt-German-ebook/dp/B0H65ZBNYD?maas=maas_adg_241AFAA05DD8CD725A622F4F7D406E2A_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0H67Q8TLR': {
        'CA': 'https://www.amazon.ca/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_D5477F6469CA1B3C91E18C474AD38760_afap_abs&ref_=aa_maas&tag=maas',
        'UK': 'https://www.amazon.co.uk/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_17398B6BB7D67B4078D2C4642938878E_afap_abs&ref_=aa_maas&tag=maas',
        'US': 'https://www.amazon.com/First-Contact-Essentials-Peter-Cawdron-ebook/dp/B0H67Q8TLR?maas=maas_adg_F559F69ED85A36F78670AC8AF06191AF_afap_abs&ref_=aa_maas&tag=maas'
    },
    'B0HD3RRKHM': {
        'DE': 'https://www.amazon.de/Gesang-Sirenen-Erster-Kontakt-German-ebook/dp/B0HD3RRKHM?maas=maas_adg_A1F7976349D9199A1458CBA94A9ED31C_afap_abs&ref_=aa_maas&tag=maas'
    }
};

// =====================================================================
// LOCAL STORE PRICES
// Structure: AMAZON_PRICING[ASIN][MARKETPLACE_CODE] = price text.
// The 'US' entry must match the price written on the Carrd page; it is
// what gets found and replaced.
// =====================================================================
var AMAZON_PRICING = {
    'B005OJF0ZC': {
        'US': 'US 2.99',
        'IN': '299 INR',
        'UK': '2.26 GBP',
        'DE': '2.99 EUR',
        'FR': '2.99 EUR',
        'ES': '2.99 EUR',
        'IT': '2.99 EUR',
        'NL': '2.99 EUR',
        'JP': '499 JPY',
        'BR': '15 BRL',
        'CA': '4.99 CAD',
        'MX': '49.99 MXN',
        'AU': '4.99 AUD'
    },
    'B0H67Q8TLR': {
        'US': 'US 9.99',
        'IN': '599 INR',
        'UK': '7.99 GBP',
        'DE': '8.99 EUR',
        'FR': '8.99 EUR',
        'ES': '8.99 EUR',
        'IT': '8.99 EUR',
        'NL': '8.99 EUR',
        'JP': '1579 JPY',
        'BR': '31.99 BRL',
        'CA': '12.99 CAD',
        'MX': '179 MXN',
        'AU': '12.99 AUD'
    },
    'B01F02A89K': {
        'US': 'US 99c',
        'IN': '96 INR',
        'UK': '0.99 GBP',
        'DE': '0.99 EUR',
        'FR': '0.99 EUR',
        'ES': '0.99 EUR',
        'IT': '0.99 EUR',
        'NL': '0.99 EUR',
        'JP': '159 JPY',
        'BR': '5.99 BRL',
        'CA': '1.49 CAD',
        'MX': '16.99 MXN',
        'AU': '1.99 AUD'
    }
};

// Replace the US price inside one piece of text. Matches the US number
// (e.g. 2.99) together with any 'US', 'US$', '$' before it and 'USD'
// after it, so 'US 2.99', 'AmazonUS 2.99', '$2.99' and '9.99 USD' are all
// handled. A cents mark after the number ('99c', '99¢', '99 cents') is
// treated as part of the price too, so it's replaced along with it.
// A number that is only part of a bigger one (the '9.99' inside '19.99',
// the '99' inside '0.99') is left alone.
function replaceUsPrice(text, usNumber, localPrice) {
    var escaped = usNumber.replace(/\./g, '\\.');
    var re = new RegExp(
        '(US\\s*\\$?\\s*|\\$\\s*)?' + escaped +
        '(\\s*USD|\\s*\\u00A2|\\s*cents?(?![A-Za-z])|c(?![A-Za-z]))?',
        'g'
    );
    return text.replace(re, function(match, prefix, suffix, offset, whole) {
        var before = offset > 0 ? whole.charAt(offset - 1) : '';
        var after = whole.charAt(offset + match.length);
        // A whole-number price like 99 only counts with a price marker
        // ('US', '$', 'c', '¢', 'cents', 'USD'), so '99 copies' is left alone.
        if (usNumber.indexOf('.') === -1 && !prefix && !suffix) return match;
        // Part of a bigger number: leave it.
        if (!prefix && /[0-9.]/.test(before)) return match;
        if (/[0-9]/.test(after)) return match;
        // Keep a space between a word and the new price ('Amazon 4.99 AUD').
        var lead = /[A-Za-z0-9]/.test(before) ? ' ' : '';
        return lead + localPrice;
    });
}

function localizePriceText(el, asin, marketplaceCode) {
    if (!asin || marketplaceCode === 'US') return;
    if (el.getAttribute('data-vc-price-done')) return;
    var prices = AMAZON_PRICING[asin];
    if (!prices || !prices.US || !prices[marketplaceCode]) return;
    var numberMatch = prices.US.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!numberMatch) return;

    var usNumber = numberMatch[0];
    var localPrice = prices[marketplaceCode];
    var changed = false;

    (function walk(node) {
        var children = node.childNodes || [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeType === 3) {
                var updated = replaceUsPrice(child.nodeValue, usNumber, localPrice);
                if (updated !== child.nodeValue) {
                    child.nodeValue = updated;
                    changed = true;
                }
            } else if (child.nodeType === 1) {
                walk(child);
            }
        }
    })(el);

    // Mark it so a second pass can never re-process the new price.
    el.setAttribute('data-vc-price-done', '1');
    if (changed) console.log('Local price applied:', asin, '->', marketplaceCode, localPrice);
}

// =====================================================================
// ASIN -> TITLE SLUG CACHE
// Built from the attribution URLs above, so untagged fallback links
// look like Amazon's own canonical form: '/Book-Title/dp/ASIN'.
// =====================================================================
var ASIN_SLUG_CACHE = {};

(function cacheSlugs() {
    for (var asin in AMAZON_ATTRIBUTION) {
        if (!AMAZON_ATTRIBUTION.hasOwnProperty(asin)) continue;
        var entry = AMAZON_ATTRIBUTION[asin];
        for (var code in entry) {
            if (!entry.hasOwnProperty(code)) continue;
            var match = entry[code].match(/^https:\/\/[^/]+\/([^/]+)\/dp\//i);
            if (match) ASIN_SLUG_CACHE[asin] = match[1];
            break;
        }
    }
})();

// =====================================================================
// MARKETPLACE INFERENCE
// =====================================================================
var AMAZON_MARKETPLACE_DOMAINS = {
    'US': 'www.amazon.com', 'CA': 'www.amazon.ca', 'MX': 'www.amazon.com.mx',
    'BR': 'www.amazon.com.br', 'UK': 'www.amazon.co.uk', 'DE': 'www.amazon.de',
    'FR': 'www.amazon.fr', 'ES': 'www.amazon.es', 'IT': 'www.amazon.it',
    'NL': 'www.amazon.nl', 'BE': 'www.amazon.com.be', 'PL': 'www.amazon.pl',
    'SE': 'www.amazon.se', 'TR': 'www.amazon.com.tr', 'AU': 'www.amazon.com.au',
    'IN': 'www.amazon.in', 'JP': 'www.amazon.co.jp', 'SG': 'www.amazon.sg',
    'AE': 'www.amazon.ae', 'SA': 'www.amazon.sa', 'EG': 'www.amazon.eg',
    'ZA': 'www.amazon.co.za'
};

var TIMEZONE_MARKETPLACE_MAP = [
    { prefix: 'Australia/', code: 'AU' },
    { prefix: 'Pacific/Auckland', code: 'AU' },
    { prefix: 'Europe/London', code: 'UK' },
    { prefix: 'Europe/Dublin', code: 'UK' },   // Ireland has no Amazon store; Irish Kindle buyers use .co.uk
    { prefix: 'Europe/Berlin', code: 'DE' },
    { prefix: 'Europe/Vienna', code: 'DE' },
    { prefix: 'Europe/Paris', code: 'FR' },
    { prefix: 'Europe/Madrid', code: 'ES' },
    { prefix: 'Europe/Rome', code: 'IT' },
    { prefix: 'Europe/Amsterdam', code: 'NL' },
    { prefix: 'Europe/Brussels', code: 'BE' },
    { prefix: 'Europe/Warsaw', code: 'PL' },
    { prefix: 'Europe/Stockholm', code: 'SE' },
    { prefix: 'Europe/Istanbul', code: 'TR' },
    { zones: ['America/Toronto', 'America/Vancouver', 'America/Montreal', 'America/Winnipeg',
              'America/Edmonton', 'America/Halifax', 'America/St_Johns', 'America/Regina',
              'America/Moncton', 'America/Whitehorse', 'America/Glace_Bay', 'America/Goose_Bay',
              'America/Yellowknife', 'America/Iqaluit', 'America/Swift_Current',
              'America/Dawson_Creek', 'America/Fort_Nelson'], code: 'CA' },
    { zones: ['America/Mexico_City', 'America/Cancun', 'America/Monterrey', 'America/Merida', 'America/Chihuahua', 'America/Mazatlan', 'America/Tijuana'], code: 'MX' },
    { zones: ['America/Sao_Paulo', 'America/Fortaleza', 'America/Recife', 'America/Bahia', 'America/Belem', 'America/Manaus', 'America/Cuiaba', 'America/Porto_Velho', 'America/Rio_Branco'], code: 'BR' },
    { prefix: 'Asia/Kolkata', code: 'IN' },
    { prefix: 'Asia/Tokyo', code: 'JP' },
    { prefix: 'Asia/Singapore', code: 'SG' },
    { prefix: 'Asia/Dubai', code: 'AE' },
    { prefix: 'Asia/Riyadh', code: 'SA' },
    { prefix: 'Africa/Cairo', code: 'EG' },
    { prefix: 'Africa/Johannesburg', code: 'ZA' }
];

var LANGUAGE_MARKETPLACE_MAP = {
    'en-au': 'AU', 'en-gb': 'UK', 'en-ie': 'UK', 'en-ca': 'CA', 'fr-ca': 'CA',
    'es-mx': 'MX', 'pt-br': 'BR',
    'de': 'DE', 'de-de': 'DE', 'de-at': 'DE', 'de-ch': 'DE',
    'fr': 'FR', 'fr-fr': 'FR', 'fr-be': 'FR',
    'es': 'ES', 'es-es': 'ES', 'it': 'IT', 'it-it': 'IT',
    'nl': 'NL', 'nl-nl': 'NL', 'nl-be': 'NL', 'pl': 'PL', 'pl-pl': 'PL',
    'sv': 'SE', 'sv-se': 'SE', 'tr': 'TR', 'tr-tr': 'TR', 'hi': 'IN', 'hi-in': 'IN',
    'ja': 'JP', 'ja-jp': 'JP', 'zh-sg': 'SG', 'en-sg': 'SG',
    'ar-ae': 'AE', 'ar-sa': 'SA', 'ar-eg': 'EG', 'en-za': 'ZA'
};

function inferMarketplaceCode() {
    var timeZone = '';
    try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (err) {
        console.warn('Timezone detection failed:', err);
    }

    for (var i = 0; i < TIMEZONE_MARKETPLACE_MAP.length; i++) {
        var rule = TIMEZONE_MARKETPLACE_MAP[i];
        if (rule.prefix && timeZone.indexOf(rule.prefix) === 0) return rule.code;
        if (rule.zones && rule.zones.indexOf(timeZone) !== -1) return rule.code;
    }

    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return LANGUAGE_MARKETPLACE_MAP[lang] || 'US';
}

// Worked out once, up front, so every link and every click uses the same answer.
var MARKETPLACE_CODE = inferMarketplaceCode();
console.log('Inferred marketplace:', MARKETPLACE_CODE);

// =====================================================================
// AMAZON LINK LOCALIZATION
// =====================================================================
var ASIN_PATTERN = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|[?&#]|$)/i;

function extractAsinFromElement(el) {
    if (el.dataset && el.dataset.asin) return el.dataset.asin.toUpperCase();
    var href = el.getAttribute('href') || '';
    var match = href.match(ASIN_PATTERN);
    if (match) return match[1].toUpperCase();
    return null;
}

// Plain (untagged) store URL, in Amazon's canonical '/Title-Slug/dp/ASIN/' form
// when we know the slug, otherwise '/dp/ASIN/'.
function buildPlainAmazonUrl(asin, marketplaceCode) {
    var amazonDomain = AMAZON_MARKETPLACE_DOMAINS[marketplaceCode];
    if (!amazonDomain) return null;
    var slug = ASIN_SLUG_CACHE[asin];
    return 'https://' + amazonDomain + '/' + (slug ? slug + '/' : '') + 'dp/' + asin + '/';
}

function useAttribution() {
    return TRAFFIC_SOURCE === 'meta' || unknownSourceAttribution === 'meta';
}

function resolveAmazonUrl(asin, marketplaceCode) {
    asin = asin.toUpperCase();

    // 1. Meta attribution URL, if one exists for this book and store.
    var entry = useAttribution() ? AMAZON_ATTRIBUTION[asin] : null;
    if (entry && entry[marketplaceCode]) {
        return { url: entry[marketplaceCode], kind: 'attribution' };
    }

    // 2. Otherwise the plain local store link (no attribution tag).
    var plain = buildPlainAmazonUrl(asin, marketplaceCode);
    if (plain) return { url: plain, kind: 'plain' };

    return null;
}

function applyAmazonLink(el, asin, marketplaceCode, quiet) {
    if (!asin) return;
    var resolved = resolveAmazonUrl(asin, marketplaceCode);
    if (!resolved) {
        if (!quiet) console.log('No Amazon marketplace available:', asin, marketplaceCode);
        return;
    }
    // Remember the ASIN so it survives the href being rewritten.
    if (el.dataset && !el.dataset.asin) el.dataset.asin = asin.toUpperCase();
    el.setAttribute('href', resolved.url);
    if (!quiet) {
        console.log(
            (resolved.kind === 'attribution'
                ? 'Amazon Attribution applied (' + TRAFFIC_SOURCE + '):'
                : 'Local Amazon marketplace applied:'),
            asin, '->', marketplaceCode, resolved.url
        );
    }
}

// Localize every Amazon link (href and price text) on the page.
// Safe to run more than once.
function localizeAmazonLinks(quiet) {
    document.querySelectorAll('a[href*="amazon" i]').forEach(function(el) {
        var asin = extractAsinFromElement(el);
        if (!asin) {
            if (!quiet) console.log('Amazon link found but no ASIN:', el.getAttribute('href') || '');
            return;
        }
        applyAmazonLink(el, asin, MARKETPLACE_CODE, quiet);
        localizePriceText(el, asin, MARKETPLACE_CODE);
    });
}

// =====================================================================
// PAGE INTERACTION TRACKING
// =====================================================================
document.addEventListener('DOMContentLoaded', function() {

    // Tag Clarity recordings so sessions can be filtered by source/store.
    if (typeof clarity === 'function') {
        clarity('set', 'traffic_source', TRAFFIC_SOURCE);
        clarity('set', 'marketplace', MARKETPLACE_CODE);
    }

    // Carrd's links are in the static HTML, so they exist now: localize
    // immediately. Prices must be localized before the buy buttons are
    // set up below, so a button's saved label (restored when a visitor
    // comes back from Amazon) already shows the local price. Run once
    // more on 'load' in case anything is injected late.
    localizeAmazonLinks(false);
    window.addEventListener('load', function() {
        localizeAmazonLinks(true);
    });

    function trackViewContent(contentName, contentCategory) {
        try {
            if (typeof fbq === 'function') {
                fbq('track', 'ViewContent', {
                    content_name: contentName,
                    content_category: contentCategory,
                    content_type: 'product'
                });
                console.log('...Meta pixel ViewContent sent (' + contentName + ')');
            }
        } catch (err) {
            console.error('Meta Pixel error:', err);
        }
    }

    function attachViewContentListener(selectorList, contentName, contentCategory) {
        normalizeSelectorList(selectorList).forEach(function(selector) {
            document.querySelectorAll(selector).forEach(function(el) {
                el.setAttribute(TRACKED_ATTR, 'true');
                el.addEventListener('click', function() {
                    trackViewContent(contentName, contentCategory);
                });
            });
        });
    }

    attachViewContentListener(reviewTags, 'Reviews', 'Social Proof');
    attachViewContentListener(bookTags, BOOK_NAME, 'Book Image Click');
    attachViewContentListener(seriesTags, 'Series Info', 'Series');

    // SERIES_URL links have been localized by now, so match them by the
    // series ASIN rather than by the original href string.
    var seriesAsinMatch = String(SERIES_URL).match(ASIN_PATTERN);
    var seriesAsin = seriesAsinMatch ? seriesAsinMatch[1].toUpperCase() : null;
    document.querySelectorAll('a[href*="amazon" i]').forEach(function(link) {
        if (!seriesAsin || extractAsinFromElement(link) !== seriesAsin) return;
        if (link.closest('[' + TRACKED_ATTR + ']')) return;
        link.addEventListener('click', function() {
            trackViewContent('Series Info', 'Series');
        });
    });

    // -------------------------------------------
    // Buy button(s)
    //
    // No e.preventDefault() and no manual navigation: the click stays a
    // genuine native anchor navigation so iOS/Android treat it as a
    // trusted user gesture eligible for Universal Links / App Links
    // (deep linking into the Amazon / Kindle app). The href is
    // re-localized here first, so it is correct even if the visitor
    // clicks before anything else has run.
    // -------------------------------------------
    function attachBuyButton(selector) {
        var button = document.querySelector(selector);
        if (!button) {
            console.warn('Buy button not found:', selector);
            return;
        }

        var labelEl = button.querySelector('.label');
        button.dataset.vcOriginalLabel = labelEl ? labelEl.textContent : '';

        button.addEventListener('click', function() {
            applyAmazonLink(button, extractAsinFromElement(button) || BOOK_ASIN, MARKETPLACE_CODE, true);
            var destination = button.href;
            var firstCheckout = !checkoutAlreadySent();
            console.log('Pixel running... (' + selector + ') [' + TRAFFIC_SOURCE + '] ' +
                (firstCheckout ? '' : '(checkout already counted this visit) ') + '->', destination);

            markLeftForAmazon();
            var pageLeft = false;
            window.addEventListener('pagehide', function() { pageLeft = true; }, { once: true });

            button.style.pointerEvents = 'none';
            var label = button.querySelector('.label');
            if (label) label.textContent = 'Opening Amazon Book Page...';
            button.style.transition = 'opacity 0.25s ease';
            button.style.opacity = '0.6';

            if (firstCheckout) {
                markCheckoutSent();
                trackInitiateCheckout();
            }

            // Safety net: only a stall if, 2s later, the page is still
            // open AND still on screen. If the Amazon app opened, the page
            // is hidden rather than stalled, so nothing is reported.
            setTimeout(function() {
                if (pageLeft || document.visibilityState !== 'visible') return;
                if (typeof clarity === 'function') {
                    clarity('event', 'nav_stalled');
                }
                console.warn('Navigation appears to have stalled:', destination);
                resetBuyButtons();
            }, 2000);
        });
    }

    // Put the buy button(s) back to normal so a returning visitor can
    // tap again.
    function resetBuyButtons() {
        normalizeSelectorList(buyButtonTags).forEach(function(selector) {
            var button = document.querySelector(selector);
            if (!button) return;
            button.style.pointerEvents = '';
            button.style.opacity = '';
            var label = button.querySelector('.label');
            if (label && button.dataset.vcOriginalLabel) {
                label.textContent = button.dataset.vcOriginalLabel;
            }
        });
    }

    function handlePossibleReturn() {
        if (checkReturnedFromAmazon()) resetBuyButtons();
    }

    // Back from the Amazon app, or switching back to this tab.
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') handlePossibleReturn();
    });

    // Restored from the back/forward cache (the Back button).
    window.addEventListener('pageshow', function(evt) {
        if (evt.persisted) handlePossibleReturn();
    });

    normalizeSelectorList(buyButtonTags).forEach(attachBuyButton);

    // Reloaded fresh in the same tab after visiting Amazon. Clarity's
    // stub is defined by now, so the event is queued safely.
    handlePossibleReturn();
});
