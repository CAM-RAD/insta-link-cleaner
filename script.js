// Platform configurations
const PLATFORMS = {
    instagram: {
        name: 'Instagram',
        hosts: ['instagram.com', 'instagr.am'],
        params: ['igsh', 'igshid', 'img_index']
    },
    facebook: {
        name: 'Facebook',
        hosts: ['facebook.com', 'fb.com', 'fb.watch', 'm.facebook.com'],
        params: ['fbclid', 'mibextid', '__cft__', '__tn__', 'ref', 'fref', 'rc', 'notif_id', 'notif_t', 'ref_type', 'ref_component', 'ref_page']
    },
    threads: {
        name: 'Threads',
        hosts: ['threads.net'],
        params: ['igsh', 'igshid']
    },
    tiktok: {
        name: 'TikTok',
        hosts: ['tiktok.com', 'vm.tiktok.com'],
        params: ['_t', '_r', 'is_copy_url', 'is_from_webapp', 'sender_device', 'sender_web_id', 'source', 'tt_from', 'u_code', 'enter_method']
    },
    twitter: {
        name: 'X / Twitter',
        hosts: ['twitter.com', 'x.com', 't.co'],
        params: ['s', 't', 'ref_src', 'ref_url', 'twclid']
    },
    youtube: {
        name: 'YouTube',
        hosts: ['youtube.com', 'youtu.be', 'm.youtube.com'],
        params: ['si', 'feature', 'pp', 'embeds_referring_euri', 'source_ve_path']
    }
};

// Universal tracking params (removed from all URLs)
const UNIVERSAL_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    'gclid', 'gad_source', 'gbraid', 'wbraid',  // Google
    'msclkid',  // Microsoft
    'dclid',    // DoubleClick
    'oly_enc_id', 'oly_anon_id',  // Omniture
    'vero_id', 'vero_conv',  // Vero
    '_ga', '_gl',  // Google Analytics
    'mc_cid', 'mc_eid',  // Mailchimp
    'trk', 'trkInfo',  // LinkedIn
    'share_source', 'share_medium'
];

// Detect platform from URL
function detectPlatform(hostname) {
    for (const [key, platform] of Object.entries(PLATFORMS)) {
        if (platform.hosts.some(host => hostname.includes(host))) {
            return { key, ...platform };
        }
    }
    return null;
}

// Clean URL by removing tracking parameters
function cleanUrl(inputUrl) {
    let url;

    try {
        let urlString = inputUrl.trim();
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'https://' + urlString;
        }
        url = new URL(urlString);
    } catch (e) {
        throw new Error('Invalid URL format');
    }

    const hostname = url.hostname.toLowerCase();
    const platform = detectPlatform(hostname);

    if (!platform) {
        throw new Error('Unsupported platform. Try Instagram, TikTok, Facebook, Threads, X/Twitter, or YouTube.');
    }

    // Remove platform-specific params
    platform.params.forEach(param => {
        url.searchParams.delete(param);
    });

    // Remove universal tracking params
    UNIVERSAL_PARAMS.forEach(param => {
        url.searchParams.delete(param);
    });

    // Remove any remaining params that look like tracking
    const paramsToRemove = [];
    url.searchParams.forEach((value, key) => {
        if (key.startsWith('utm_') || key.startsWith('fb_') || key.startsWith('ig_') ||
            key.startsWith('ref') || key.startsWith('_') || key.startsWith('tt_')) {
            paramsToRemove.push(key);
        }
    });
    paramsToRemove.forEach(param => {
        url.searchParams.delete(param);
    });

    // Build clean URL
    let cleanUrl = url.origin + url.pathname;

    // Ensure trailing slash for consistency (except YouTube)
    if (!cleanUrl.endsWith('/') && !hostname.includes('youtu')) {
        cleanUrl += '/';
    }

    // Keep important params (like YouTube video ID 'v')
    const keepParams = ['v', 't', 'list'];  // YouTube video, timestamp, playlist
    let keptParams = new URLSearchParams();
    keepParams.forEach(param => {
        if (url.searchParams.has(param)) {
            keptParams.set(param, url.searchParams.get(param));
        }
    });

    if (keptParams.toString()) {
        cleanUrl += '?' + keptParams.toString();
    }

    return { url: cleanUrl, platform: platform.name };
}

// DOM Elements
const inputUrl = document.getElementById('input-url');
const cleanBtn = document.getElementById('clean-btn');
const outputSection = document.getElementById('output-section');
const outputUrl = document.getElementById('output-url');
const outputLabel = document.querySelector('.output-label');
const copyBtn = document.getElementById('copy-btn');
const openBtn = document.getElementById('open-btn');
const status = document.getElementById('status');
const infoToggle = document.getElementById('info-toggle');
const info = document.querySelector('.info');

// Clean button click handler
cleanBtn.addEventListener('click', () => {
    const input = inputUrl.value.trim();

    if (!input) {
        showStatus('Please enter a URL', true);
        outputSection.classList.remove('show');
        return;
    }

    try {
        const result = cleanUrl(input);
        outputUrl.value = result.url;
        outputLabel.innerHTML = '<span class="check-icon">&#10003;</span> ' + result.platform + ' link cleaned';
        outputSection.classList.add('show');
        showStatus('');
    } catch (e) {
        showStatus(e.message, true);
        outputSection.classList.remove('show');
    }
});

// Allow Enter key to trigger clean
inputUrl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        cleanBtn.click();
    }
});

// Copy button click handler
copyBtn.addEventListener('click', async () => {
    const copyText = copyBtn.querySelector('.copy-text');

    try {
        await navigator.clipboard.writeText(outputUrl.value);
        showStatus('Copied to clipboard!');

        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyText.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (e) {
        outputUrl.select();
        document.execCommand('copy');
        showStatus('Copied to clipboard!');
    }
});

// Open button click handler
openBtn.addEventListener('click', () => {
    if (outputUrl.value) {
        window.open(outputUrl.value, '_blank');
    }
});

// Info toggle
infoToggle.addEventListener('click', () => {
    info.classList.toggle('open');
});

// Show status message
function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = 'status' + (isError ? ' error' : '');
}

// Auto-focus input on page load
inputUrl.focus();
