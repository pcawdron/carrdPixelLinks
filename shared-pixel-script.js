// =====================================================================
// SHARED SCRIPT -- host this file on GitHub, reference it via a CDN
// (see deployment notes) from each Carrd page, AFTER that page's own
// local configuration variables have been declared.
//
// REQUIRED per-page variables (declared with `var` in the page <head>):
//   PIXEL_ID, BOOK_NAME, BOOK_PRICE, BOOK_ASIN, SERIES_URL,
//   bookTags, reviewTags, seriesTags, buyButtonTags,
//   BrowserBannerContainer, BrowserBannerDivider
//
// OPTIONAL per-page variables (pages that omit them behave as before):
//   GOOGLE_ADS_ID                 e.g. 'AW-993658037'
//   GOOGLE_BEGIN_CHECKOUT_LABEL   label from the Google Ads "Begin checkout"
//                                 conversion action (the part after the slash
//                                 in send_to: 'AW-xxxx/LABEL')
//   GOOGLE_NAV_MODE               'native' (default) or 'callback'
//   UNKNOWN_SOURCE_ATTRIBUTION    'meta' (default) or 'none'
//
// <script src="https://cdn.jsdelivr.net/gh/pcawdron/carrdPixelLinks@latest/shared-pixel-script.js"></script>
// =====================================================================
console.log('Pixel script loaded... v1.06');

var TRACKED_ATTR = 'data-vc-tracked';

// =====================================================================
// OPTIONAL CONFIG (safe when a page has not declared these)
// =====================================================================
function optionalConfig(name, fallback) {
    var v = window[name];
    return (typeof v === 'undefined' || v === null || v === '') ? fallback : v;
}

var googleAdsId = optionalConfig('GOOGLE_ADS_ID', '');
var googleBeginCheckoutLabel = optionalConfig('GOOGLE_BEGIN_CHECKOUT_LABEL', '');
var googleNavMode = optionalConfig('GOOGLE_NAV_MODE', 'native');
var unknownSourceAttribution = optionalConfig('UNKNOWN_SOURCE_ATTRIBUTION', 'meta');

// =====================================================================
// BROWSER DETECTION HELPER
// =====================================================================
function getUA() {
    return navigator.userAgent || navigator.vendor || window.opera || '';
}

function isMetaInAppBrowser() {
    return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram/i.test(getUA());
}

// =====================================================================
// TRAFFIC SOURCE DETECTION
//
// Returns 'google', 'meta' or 'other'.
//
// Order of evidence:
//   1. Explicit utm_source (set by you in the ad's URL parameters)
//   2. Click IDs the ad platforms add themselves
//        Google: gclid / gbraid / wbraid     Meta: fbclid
//   3. Running inside Facebook/Instagram's in-app browser
//   4. Otherwise 'other'
//
// document.referrer is deliberately NOT used: an organic Google Search
// visitor has a Google referrer too, and would wrongly fire Google Ads
// conversions.
// =====================================================================
function detectTrafficSource() {
    var params = null;
    try {
        params = new URLSearchParams(window.location.search);
    } catch (err) {
        params = null;
    }

    if (params) {
        var utm = (params.get('utm_source') || '').toLowerCase();
        if (['google', 'googleads', 'google_ads', 'adwords', 'gads'].indexOf(utm) !== -1) return 'google';
        if (['facebook', 'fb', 'instagram', 'ig', 'meta', 'threads'].indexOf(utm) !== -1) return 'meta';

        if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) return 'google';
        if (params.has('fbclid')) return 'meta';
    }

    if (isMetaInAppBrowser()) return 'meta';

    return 'other';
}

var TRAFFIC_SOURCE = detectTrafficSource();
console.log('Traffic source detected:', TRAFFIC_SOURCE);

// =====================================================================
// VISITOR EXTERNAL ID
// =====================================================================
var externalId = localStorage.getItem('meta_external_id');
if (!externalId) {
    externalId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    localStorage.setItem('meta_external_id', externalId);
}

// =====================================================================
// META PIXEL BASE CODE
// Loaded for everything EXCEPT visits positively identified as Google,
// so existing Meta/other behaviour is unchanged.
// =====================================================================
if (TRAFFIC_SOURCE !== 'google') {
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
}

// =====================================================================
// GOOGLE TAG (gtag.js)
// Only loaded for visits identified as Google, and only if the page
// supplies a GOOGLE_ADS_ID.
// =====================================================================
if (TRAFFIC_SOURCE === 'google' && googleAdsId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
        window.dataLayer.push(arguments);
    };

    var gtagLoader = document.createElement('script');
    gtagLoader.async = true;
    gtagLoader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(googleAdsId);
    document.head.appendChild(gtagLoader);

    window.gtag('js', new Date());
    window.gtag('config', googleAdsId);
}

// =====================================================================
// CHECKOUT-INITIATED EVENTS (one per platform)
// =====================================================================
function sendMetaInitiateCheckout() {
    console.log('...trying InitiateCheckout pixel');
    try {
        if (typeof fbq === 'function') {
            fbq('track', 'InitiateCheckout', {
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

// Optional callback is invoked by Google's tag once the event has been
// sent (used only in GOOGLE_NAV_MODE = 'callback').
function sendGoogleBeginCheckout(callback) {
    try {
        if (typeof window.gtag !== 'function' || !googleAdsId) {
            console.log('...Google tag NOT SENT (tag not initialised)');
            if (callback) callback();
            return;
        }
        if (!googleBeginCheckoutLabel) {
            console.warn('...Google conversion NOT SENT: GOOGLE_BEGIN_CHECKOUT_LABEL is not set');
            if (callback) callback();
            return;
        }

        var payload = {
            send_to: googleAdsId + '/' + googleBeginCheckoutLabel,
            value: BOOK_PRICE,
            currency: 'USD'
        };
        if (callback) payload.event_callback = callback;

        window.gtag('event', 'conversion', payload);
        console.log('...Google Ads begin_checkout conversion sent');
    } catch (err) {
        console.error('Google tag error:', err);
        if (callback) callback();
    }
}

function trackInitiateCheckout() {
    if (TRAFFIC_SOURCE === 'google') {
        sendGoogleBeginCheckout();
    } else {
        sendMetaInitiateCheckout();
    }
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
// AMAZON MARKETPLACE ATTRIBUTION DATA -- META (and default traffic)
// Structure: AMAZON_ATTRIBUTION[ASIN][MARKETPLACE_CODE] = full URL
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
// AMAZON MARKETPLACE ATTRIBUTION DATA -- GOOGLE
// Same structure as above. Fill this in from a separate Amazon
// Attribution export made for Google ad groups. Until an ASIN +
// marketplace has an entry here, Google visitors get the plain store
// link (never the Meta tag), so Google purchases can't be credited to
// Meta ad groups.
// =====================================================================
var AMAZON_ATTRIBUTION_GOOGLE = {
    // 'B0H67Q8TLR': {
    //     'US': 'https://www.amazon.com/.../dp/B0H67Q8TLR?maas=...',
    //     'CA': '...',
    //     'UK': '...'
    // }
};

function getAttributionTable() {
    if (TRAFFIC_SOURCE === 'google') return AMAZON_ATTRIBUTION_GOOGLE;
    if (TRAFFIC_SOURCE === 'meta') return AMAZON_ATTRIBUTION;
    // 'other' traffic: 'meta' preserves the original behaviour;
    // 'none' gives untagged plain store links.
    return (unknownSourceAttribution === 'meta') ? AMAZON_ATTRIBUTION : {};
}

// =====================================================================
// MARKETPLACE INFERENCE + AMAZON FALLBACK
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
    { prefix: 'Europe/Dublin', code: 'IE' },
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
    { zones: ['America/Toronto', 'America/Vancouver', 'America/Montreal', 'America/Winnipeg', 'America/Edmonton', 'America/Halifax', 'America/St_Johns'], code: 'CA' },
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
    if (lang === 'en-au') return 'AU';
    if (lang === 'en-gb') return 'UK';
    if (lang === 'en-ie') return 'IE';
    if (lang === 'en-ca' || lang === 'fr-ca') return 'CA';
    if (lang === 'es-mx') return 'MX';
    if (lang === 'pt-br') return 'BR';
    if (lang === 'de' || lang === 'de-de' || lang === 'de-at' || lang === 'de-ch') return 'DE';
    if (lang === 'fr' || lang === 'fr-fr' || lang === 'fr-be') return 'FR';
    if (lang === 'es' || lang === 'es-es') return 'ES';
    if (lang === 'it' || lang === 'it-it') return 'IT';
    if (lang === 'nl' || lang === 'nl-nl' || lang === 'nl-be') return 'NL';
    if (lang === 'pl' || lang === 'pl-pl') return 'PL';
    if (lang === 'sv' || lang === 'sv-se') return 'SE';
    if (lang === 'tr' || lang === 'tr-tr') return 'TR';
    if (lang === 'hi' || lang === 'hi-in') return 'IN';
    if (lang === 'ja' || lang === 'ja-jp') return 'JP';
    if (lang === 'zh-sg' || lang === 'en-sg') return 'SG';
    if (lang === 'ar-ae') return 'AE';
    if (lang === 'ar-sa') return 'SA';
    if (lang === 'ar-eg') return 'EG';
    if (lang === 'en-za') return 'ZA';

    return 'US';
}

// =====================================================================
// AMAZON LINK LOCALIZATION
// =====================================================================
var ASIN_PATTERN = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|[?&]|$)/i;

function extractAsinFromElement(el) {
    if (el.dataset && el.dataset.asin) return el.dataset.asin.toUpperCase();
    var href = el.getAttribute('href') || '';
    var match = href.match(ASIN_PATTERN);
    if (match) return match[1].toUpperCase();
    return null;
}

function applyAmazonLink(el, asin, marketplaceCode) {
    if (!asin) return;
    asin = asin.toUpperCase();

    // 1. Attribution URL for this traffic source, if one exists.
    var attributionEntry = getAttributionTable()[asin];
    if (attributionEntry && attributionEntry[marketplaceCode]) {
        el.setAttribute('href', attributionEntry[marketplaceCode]);
        console.log('Amazon Attribution applied (' + TRAFFIC_SOURCE + '):', asin, '->', marketplaceCode);
        return;
    }

    // 2. Otherwise the plain local store link (no attribution tag).
    var amazonDomain = AMAZON_MARKETPLACE_DOMAINS[marketplaceCode];
    if (amazonDomain) {
        var localUrl = 'https://' + amazonDomain + '/dp/' + asin;
        el.setAttribute('href', localUrl);
        console.log('Local Amazon marketplace applied:', asin, '->', marketplaceCode);
        return;
    }

    console.log('No Amazon marketplace available:', asin, marketplaceCode);
}

function rewriteAmazonLinks(marketplaceCode) {
    document.querySelectorAll('a[href*="amazon" i]').forEach(function(el) {
        var originalHref = el.getAttribute('href') || '';
        var asin = extractAsinFromElement(el);
        if (!asin) {
            console.log('Amazon link found but no ASIN:', originalHref);
            return;
        }
        applyAmazonLink(el, asin, marketplaceCode);
    });
}

// =====================================================================
// "OPEN IN BROWSER" BANNER -- shown to any Meta in-app-browser visitor.
// =====================================================================
function updateMetaBrowserBanner() {
    var container = document.querySelector(BrowserBannerContainer);
    if (!container) return;
    var divider = document.querySelector(BrowserBannerDivider);
    var showBanner = isMetaInAppBrowser();
    container.style.setProperty('display', showBanner ? 'block' : 'none', 'important');
    if (divider) {
        divider.style.setProperty('display', showBanner ? 'block' : 'none', 'important');
    }
}
window.addEventListener('load', updateMetaBrowserBanner);

// =====================================================================
// PAGE INTERACTION TRACKING
// =====================================================================
document.addEventListener('DOMContentLoaded', function() {

    // Tag Clarity recordings with the traffic source so sessions can be
    // filtered Google vs Meta. (Clarity's stub is defined by now.)
    if (typeof clarity === 'function') {
        clarity('set', 'traffic_source', TRAFFIC_SOURCE);
    }

    var marketplaceCode = inferMarketplaceCode();
    console.log('Inferred marketplace:', marketplaceCode);

    setTimeout(function() {
        rewriteAmazonLinks(marketplaceCode);
    }, 500);

    function trackViewContent(contentName, contentCategory) {
        // Meta-only engagement event; Google visits don't load the Meta pixel.
        if (TRAFFIC_SOURCE === 'google') return;
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

    document.querySelectorAll('a[href="' + SERIES_URL + '"]').forEach(function(link) {
        if (link.closest('[' + TRACKED_ATTR + ']')) return;
        link.addEventListener('click', function() {
            trackViewContent('Series Info', 'Series');
        });
    });

    // -------------------------------------------
    // Buy button(s)
    //
    // Default: no e.preventDefault() and no manual navigation. The click
    // is left as a genuine native anchor navigation, following the href
    // already localized by rewriteAmazonLinks(), so iOS/Android can treat
    // it as a trusted user gesture eligible for Universal Links / App
    // Links.
    //
    // Exception: Google traffic with GOOGLE_NAV_MODE = 'callback'. That
    // holds navigation until Google's tag confirms the conversion was
    // sent (Google's documented pattern for click conversions), with a
    // 1s fallback so a blocked tag can never strand the visitor.
    // -------------------------------------------
    function attachBuyButton(selector) {
        var button = document.querySelector(selector);
        if (!button) return;

        button.addEventListener('click', function(e) {
            console.log('Pixel running... (' + selector + ') [' + TRAFFIC_SOURCE + ']');

            var destination = this.href;

            var holdForGoogle = (
                TRAFFIC_SOURCE === 'google' &&
                googleNavMode === 'callback' &&
                googleAdsId &&
                googleBeginCheckoutLabel
            );

            if (holdForGoogle) {
                e.preventDefault();
            }

            button.style.pointerEvents = 'none';

            var label = button.querySelector('.label');
            if (label) {
                label.textContent = 'Opening Amazon Book Page...';
            }

            button.style.transition = 'opacity 0.25s ease';
            button.style.opacity = '0.6';

            if (holdForGoogle) {
                var navigated = false;
                var go = function() {
                    if (navigated) return;
                    navigated = true;
                    window.location.assign(destination);
                };
                sendGoogleBeginCheckout(go);
                setTimeout(go, 1000);
            } else {
                trackInitiateCheckout();
            }

            // General safety net: fires only if the page is somehow
            // still here 2s later (i.e. navigation never happened).
            setTimeout(function() {
                if (typeof clarity === 'function') {
                    clarity('event', 'nav_stalled');
                }
                console.warn('Navigation appears to have stalled:', destination);
            }, 2000);
        });
    }

    normalizeSelectorList(buyButtonTags).forEach(attachBuyButton);
});
