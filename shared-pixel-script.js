// =====================================================================
// TIMEOUT DELAYED SHARED SCRIPT -- host this file on GitHub, reference it via a CDN
// (see deployment notes) from each Carrd page, AFTER that page's own
// local configuration variables have been declared.
//
// This file assumes the following variables already exist in global
// scope by the time it runs (declared in each page's own <head>):
//   PIXEL_ID, BOOK_NAME, BOOK_PRICE, BOOK_ASIN, SERIES_URL,
//   bookTags, reviewTags, seriesTags, buyButtonTags,
//   BrowserBannerContainer, BrowserBannerDivider
// =====================================================================

var TRACKED_ATTR = 'data-vc-tracked';

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
// BROWSER DETECTION HELPER
// =====================================================================
function getUA() {
    return navigator.userAgent || navigator.vendor || window.opera || '';
}

function isMetaInAppBrowser() {
    return /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram/i.test(getUA());
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
// AMAZON MARKETPLACE ATTRIBUTION DATA
// Generated from the Amazon Attribution export. Re-generate and
// replace this block whenever new attribution links are issued.
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
// MARKETPLACE INFERENCE + AMAZON FALLBACK
//
// Priority when rewriting an Amazon link:
//   1. Amazon Attribution URL for this ASIN + marketplace, if available.
//   2. Normal local Amazon marketplace URL, if the marketplace is known.
//   3. Otherwise leave the original URL untouched.
//
// The Attribution table above is deliberately kept separate from the
// marketplace-domain table below. This means adding a local marketplace
// fallback can never overwrite an Attribution URL.
// =====================================================================

var AMAZON_MARKETPLACE_DOMAINS = {
    'US': 'www.amazon.com',
    'CA': 'www.amazon.ca',
    'MX': 'www.amazon.com.mx',
    'BR': 'www.amazon.com.br',
    'UK': 'www.amazon.co.uk',
    'DE': 'www.amazon.de',
    'FR': 'www.amazon.fr',
    'ES': 'www.amazon.es',
    'IT': 'www.amazon.it',
    'NL': 'www.amazon.nl',
    'BE': 'www.amazon.com.be',
    'PL': 'www.amazon.pl',
    'SE': 'www.amazon.se',
    'TR': 'www.amazon.com.tr',
    'AU': 'www.amazon.com.au',
    'IN': 'www.amazon.in',
    'JP': 'www.amazon.co.jp',
    'SG': 'www.amazon.sg',
    'AE': 'www.amazon.ae',
    'SA': 'www.amazon.sa',
    'EG': 'www.amazon.eg',
    'ZA': 'www.amazon.co.za'
};


// =====================================================================
// TIMEZONE -> AMAZON MARKETPLACE
//
// Timezone is the strongest browser-side location signal available here.
// Some Amazon stores cannot be distinguished reliably by timezone alone,
// because multiple countries share the same timezone.
//
// Browser language/country is therefore used as a secondary signal only
// when timezone does not identify a marketplace.
// =====================================================================

var TIMEZONE_MARKETPLACE_MAP = [

    // Australia
    { prefix: 'Australia/', code: 'AU' },

    // United Kingdom
    { prefix: 'Europe/London', code: 'UK' },

    // Ireland
    { prefix: 'Europe/Dublin', code: 'IE' },

    // Germany / Austria
    { prefix: 'Europe/Berlin', code: 'DE' },
    { prefix: 'Europe/Vienna', code: 'DE' },

    // France
    { prefix: 'Europe/Paris', code: 'FR' },

    // Spain
    { prefix: 'Europe/Madrid', code: 'ES' },

    // Italy
    { prefix: 'Europe/Rome', code: 'IT' },

    // Netherlands
    { prefix: 'Europe/Amsterdam', code: 'NL' },

    // Belgium
    { prefix: 'Europe/Brussels', code: 'BE' },

    // Poland
    { prefix: 'Europe/Warsaw', code: 'PL' },

    // Sweden
    { prefix: 'Europe/Stockholm', code: 'SE' },

    // Turkey
    { prefix: 'Europe/Istanbul', code: 'TR' },

    // Canada
    {
        zones: [
            'America/Toronto',
            'America/Vancouver',
            'America/Montreal',
            'America/Winnipeg',
            'America/Edmonton',
            'America/Halifax',
            'America/St_Johns'
        ],
        code: 'CA'
    },

    // Mexico
    {
        zones: [
            'America/Mexico_City',
            'America/Cancun',
            'America/Monterrey',
            'America/Merida',
            'America/Chihuahua',
            'America/Mazatlan',
            'America/Tijuana'
        ],
        code: 'MX'
    },

    // Brazil
    {
        zones: [
            'America/Sao_Paulo',
            'America/Fortaleza',
            'America/Recife',
            'America/Bahia',
            'America/Belem',
            'America/Manaus',
            'America/Cuiaba',
            'America/Porto_Velho',
            'America/Rio_Branco'
        ],
        code: 'BR'
    },

    // India
    { prefix: 'Asia/Kolkata', code: 'IN' },

    // Japan
    { prefix: 'Asia/Tokyo', code: 'JP' },

    // Singapore
    { prefix: 'Asia/Singapore', code: 'SG' },

    // United Arab Emirates
    { prefix: 'Asia/Dubai', code: 'AE' },

    // Saudi Arabia
    { prefix: 'Asia/Riyadh', code: 'SA' },

    // Egypt
    { prefix: 'Africa/Cairo', code: 'EG' },

    // South Africa
    { prefix: 'Africa/Johannesburg', code: 'ZA' }
];


function inferMarketplaceCode() {

    var timeZone = '';

    try {
        timeZone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (err) {
        console.warn('Timezone detection failed:', err);
    }


    // ---------------------------------------------------------------
    // 1. Try timezone first.
    // ---------------------------------------------------------------

    for (var i = 0; i < TIMEZONE_MARKETPLACE_MAP.length; i++) {

        var rule = TIMEZONE_MARKETPLACE_MAP[i];

        if (
            rule.prefix &&
            timeZone.indexOf(rule.prefix) === 0
        ) {
            return rule.code;
        }

        if (
            rule.zones &&
            rule.zones.indexOf(timeZone) !== -1
        ) {
            return rule.code;
        }
    }


    // ---------------------------------------------------------------
    // 2. Timezone was ambiguous/unrecognised.
    //    Use browser language as a weaker secondary signal.
    // ---------------------------------------------------------------

    var lang =
        (
            navigator.language ||
            navigator.userLanguage ||
            ''
        ).toLowerCase();


    if (lang === 'en-au') return 'AU';

    if (lang === 'en-gb') return 'UK';

    if (lang === 'en-ie') return 'IE';

    if (
        lang === 'en-ca' ||
        lang === 'fr-ca'
    ) {
        return 'CA';
    }

    if (lang === 'es-mx') return 'MX';

    if (lang === 'pt-br') return 'BR';

    if (
        lang === 'de' ||
        lang === 'de-de' ||
        lang === 'de-at' ||
        lang === 'de-ch'
    ) {
        return 'DE';
    }

    if (
        lang === 'fr' ||
        lang === 'fr-fr' ||
        lang === 'fr-be'
    ) {
        return 'FR';
    }

    if (
        lang === 'es' ||
        lang === 'es-es'
    ) {
        return 'ES';
    }

    if (
        lang === 'it' ||
        lang === 'it-it'
    ) {
        return 'IT';
    }

    if (
        lang === 'nl' ||
        lang === 'nl-nl' ||
        lang === 'nl-be'
    ) {
        return 'NL';
    }

    if (
        lang === 'pl' ||
        lang === 'pl-pl'
    ) {
        return 'PL';
    }

    if (
        lang === 'sv' ||
        lang === 'sv-se'
    ) {
        return 'SE';
    }

    if (
        lang === 'tr' ||
        lang === 'tr-tr'
    ) {
        return 'TR';
    }

    if (
        lang === 'hi' ||
        lang === 'hi-in'
    ) {
        return 'IN';
    }

    if (
        lang === 'ja' ||
        lang === 'ja-jp'
    ) {
        return 'JP';
    }

    if (
        lang === 'zh-sg' ||
        lang === 'en-sg'
    ) {
        return 'SG';
    }

    if (lang === 'ar-ae') return 'AE';

    if (lang === 'ar-sa') return 'SA';

    if (lang === 'ar-eg') return 'EG';

    if (lang === 'en-za') return 'ZA';


    // ---------------------------------------------------------------
    // 3. Final fallback.
    //
    // US means "leave the existing link alone".
    // ---------------------------------------------------------------

    return 'US';
}


// =====================================================================
// AMAZON LINK LOCALIZATION
// =====================================================================

// Handles both:
//   https://www.amazon.com/dp/B082KKRH1Z
//   https://www.amazon.com/gp/product/B01F02A89K
//
// The leading slash makes this more precise without changing the
// behaviour for the Amazon URL formats used on the pages.
var ASIN_PATTERN =
    /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|[?&]|$)/i;


function extractAsinFromElement(el) {

    // First use an explicit data-asin attribute if present.
    if (
        el.dataset &&
        el.dataset.asin
    ) {
        return el.dataset.asin.toUpperCase();
    }


    // Otherwise extract the ASIN from the href.
    var href =
        el.getAttribute('href') || '';

    var match =
        href.match(ASIN_PATTERN);

    if (match) {
        return match[1].toUpperCase();
    }

    return null;
}


// =====================================================================
// APPLY AMAZON LINK
//
// IMPORTANT:
// Attribution has absolute priority.
//
// If an Attribution URL exists for the ASIN + marketplace, this
// function sets that URL and RETURNS immediately. The ordinary local
// Amazon fallback therefore cannot overwrite it.
//
// If no Attribution URL exists, the function constructs a normal
// Amazon marketplace URL such as:
//
//   https://www.amazon.com.au/dp/B01F02A89K
//
// If the marketplace is unknown, the original URL is untouched.
// =====================================================================

function applyAmazonLink(
    el,
    asin,
    marketplaceCode
) {

    if (!asin) return;

    asin = asin.toUpperCase();


    // ---------------------------------------------------------------
    // PRIORITY 1: AMAZON ATTRIBUTION URL
    // ---------------------------------------------------------------

    var attributionEntry =
        AMAZON_ATTRIBUTION[asin];

    if (
        attributionEntry &&
        attributionEntry[marketplaceCode]
    ) {

        var attributionUrl =
            attributionEntry[marketplaceCode];

        el.setAttribute(
            'href',
            attributionUrl
        );

        console.log(
            'Amazon Attribution applied:',
            asin,
            '->',
            marketplaceCode,
            attributionUrl
        );

        // CRITICAL: prevents fallback from overwriting attribution.
        return;
    }


    // ---------------------------------------------------------------
    // PRIORITY 2: NORMAL LOCAL AMAZON STORE
    // ---------------------------------------------------------------

    var amazonDomain =
        AMAZON_MARKETPLACE_DOMAINS[marketplaceCode];

    if (amazonDomain) {

        var localUrl =
            'https://' +
            amazonDomain +
            '/dp/' +
            asin;

        el.setAttribute(
            'href',
            localUrl
        );

        console.log(
            'Local Amazon marketplace applied:',
            asin,
            '->',
            marketplaceCode,
            localUrl
        );

        return;
    }


    // ---------------------------------------------------------------
    // PRIORITY 3: NO KNOWN MARKETPLACE
    // ---------------------------------------------------------------

    console.log(
        'No Amazon marketplace available:',
        asin,
        marketplaceCode
    );
}


// =====================================================================
// REWRITE AMAZON LINKS
// =====================================================================

function rewriteAmazonLinks(marketplaceCode) {
    document.querySelectorAll('a[href*="amazon" i]').forEach(function(el) {
        var originalHref = el.getAttribute('href') || '';
        var asin = extractAsinFromElement(el);

        if (!asin) {
            console.log('Amazon link found but no ASIN:', originalHref);
            return;
        }

        console.log(
            'Amazon link:',
            originalHref,
            'ASIN:',
            asin,
            'Marketplace:',
            marketplaceCode
        );

        applyAmazonLink(el, asin, marketplaceCode);
    });
}

function applyAmazonLink(el, asin, marketplaceCode) {
    var entry = AMAZON_ATTRIBUTION[asin];

    // 1. Attribution URL always takes priority
    if (entry && entry[marketplaceCode]) {
        el.setAttribute('href', entry[marketplaceCode]);
        console.log(
            'Using Attribution URL for ASIN ' + asin +
            ' -> ' + marketplaceCode
        );
        return;
    }

    // 2. No Attribution URL: use the normal local Amazon store
    var domain = AMAZON_MARKETPLACE_DOMAINS[marketplaceCode];

    if (domain) {
        var localUrl = 'https://' + domain + '/dp/' + asin;
        el.setAttribute('href', localUrl);

        console.log(
            'Using local Amazon URL for ASIN ' + asin +
            ' -> ' + localUrl
        );
        return;
    }

    // 3. No known marketplace: leave the original link alone
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
    console.log('Pixel script loaded...');

    // Localize Amazon links before anything else. Buy-button click
    // handlers read `this.href` live at click time, so as long as this
    // runs on page load (well before a human can click), the pixel and
    // the navigation automatically pick up the corrected URL with no
    // special-casing needed in the button logic below.
    var marketplaceCode = inferMarketplaceCode();
    console.log('Inferred marketplace:', marketplaceCode);
    setTimeout(function() {
        rewriteAmazonLinks(inferredMarketplace);
    }, 500);

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

    document.querySelectorAll('a[href="' + SERIES_URL + '"]').forEach(function(link) {
        if (link.closest('[' + TRACKED_ATTR + ']')) return;
        link.addEventListener('click', function() {
            trackViewContent('Series Info', 'Series');
        });
    });

    // -------------------------------------------
    // Buy button(s)
    // -------------------------------------------
    function attachBuyButton(selector) {
        var button = document.querySelector(selector);
        if (!button) return;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Pixel running... (' + selector + ')');

            var destination = this.href; // reflects any localization applied above

            button.style.pointerEvents = 'none';

            var label = button.querySelector('.label');
            if (label) {
                label.textContent = 'Opening Amazon Book Page...';
            }

            button.style.transition = 'opacity 0.25s ease';
            button.style.opacity = '0.6';

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

            setTimeout(function() {
                if (typeof clarity === 'function') {
                    clarity('event', 'nav_stalled');
                }
                console.warn('Navigation appears to have stalled:', destination);
            }, 2000);

            window.location.assign(destination);
        });
    }

    normalizeSelectorList(buyButtonTags).forEach(attachBuyButton);
});
