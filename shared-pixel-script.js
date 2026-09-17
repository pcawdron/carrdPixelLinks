// =====================================================================
// SHARED SCRIPT -- host this file on GitHub, reference it via a CDN
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
// MARKETPLACE INFERENCE -- language + timezone, no permission prompt.
// Deliberately conservative: only returns a non-US code when the
// signal is reasonably clear. Anything ambiguous falls through to
// 'US', which is safe because 'US' means "don't touch the existing
// link" -- never a broken outcome, at worst a missed localization.
// =====================================================================
var TIMEZONE_MARKETPLACE_MAP = [
    { prefix: 'Australia/', code: 'AU' },
    { prefix: 'Europe/London', code: 'UK' },
    { prefix: 'Europe/Berlin', code: 'DE' },
    { prefix: 'Europe/Vienna', code: 'DE' },
    { prefix: 'Europe/Paris', code: 'FR' },
    { zones: ['America/Toronto', 'America/Vancouver', 'America/Montreal', 'America/Winnipeg', 'America/Edmonton', 'America/Halifax'], code: 'CA' }
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

    // Timezone didn't match anything specific -- fall back to language
    // as a weaker secondary signal (only trusted for a clean regional match).
    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (lang === 'en-au') return 'AU';
    if (lang === 'en-gb') return 'UK';
    if (lang === 'en-ca' || lang === 'fr-ca') return 'CA';
    if (lang === 'de' || lang === 'de-de') return 'DE';
    if (lang === 'fr' || lang === 'fr-fr') return 'FR';

    return 'US';
}

// =====================================================================
// AMAZON LINK LOCALIZATION
// Rewrites any element's href to the correct marketplace's Attribution
// link, IF a match exists. No match (or marketplace === US) leaves the
// existing href on the page completely untouched.
// =====================================================================
var ASIN_PATTERN = /(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|[?&]|$)/;

function extractAsinFromElement(el) {
    if (el.dataset && el.dataset.asin) return el.dataset.asin;

    var href = el.getAttribute('href') || '';
    var match = href.match(ASIN_PATTERN);
    if (match) return match[1];

    return null;
}

function rewriteAmazonLinks(marketplaceCode) {
    if (marketplaceCode === 'US') return; // existing links already are the US default

    // 1. Explicitly known elements: buy buttons + book image/tag links.
    //    These use short links (e.g. geni.us) that don't expose an ASIN
    //    in the href text, so we already know the ASIN from BOOK_ASIN.
    var knownSelectors = normalizeSelectorList(buyButtonTags)
        .concat(normalizeSelectorList(bookTags));

    knownSelectors.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el) {
            applyAttributionLink(el, BOOK_ASIN, marketplaceCode);
        });
    });

    // 2. Generic sweep: any other link on the page carrying a literal
    //    ASIN in its href (e.g. the reader-reviews link), regardless
    //    of which book it points to.
    document.querySelectorAll('a[href*="amazon" i]').forEach(function(el) {
        var asin = extractAsinFromElement(el);
        if (asin) applyAttributionLink(el, asin, marketplaceCode);
    });
}

function applyAttributionLink(el, asin, marketplaceCode) {
    var entry = AMAZON_ATTRIBUTION[asin];
    if (!entry || !entry[marketplaceCode]) return; // no match -- leave untouched
    el.setAttribute('href', entry[marketplaceCode]);
    console.log('Localized link for ASIN ' + asin + ' -> ' + marketplaceCode);
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
    rewriteAmazonLinks(marketplaceCode);

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
