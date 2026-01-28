// List of tracking parameters to remove
const TRACKING_PARAMS = [
    'igsh',
    'igshid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'ref',
    'share_source',
    'share_medium'
];

// Clean an Instagram URL by removing tracking parameters
function cleanInstagramUrl(inputUrl) {
    let url;

    try {
        // Add protocol if missing
        let urlString = inputUrl.trim();
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            urlString = 'https://' + urlString;
        }

        url = new URL(urlString);
    } catch (e) {
        throw new Error('Invalid URL format');
    }

    // Verify it's an Instagram URL
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes('instagram.com') && !hostname.includes('instagr.am')) {
        throw new Error('Not an Instagram URL');
    }

    // Remove tracking parameters
    TRACKING_PARAMS.forEach(param => {
        url.searchParams.delete(param);
    });

    // Remove any remaining query params that look like tracking
    const paramsToRemove = [];
    url.searchParams.forEach((value, key) => {
        if (key.startsWith('utm_') || key.startsWith('ig_') || key.startsWith('fb_')) {
            paramsToRemove.push(key);
        }
    });
    paramsToRemove.forEach(param => {
        url.searchParams.delete(param);
    });

    // Build clean URL
    let cleanUrl = url.origin + url.pathname;

    // Ensure pathname ends with / for consistency (Instagram style)
    if (!cleanUrl.endsWith('/')) {
        cleanUrl += '/';
    }

    // Add any remaining (non-tracking) query params if they exist
    if (url.searchParams.toString()) {
        cleanUrl += '?' + url.searchParams.toString();
    }

    return cleanUrl;
}

// DOM Elements
const inputUrl = document.getElementById('input-url');
const cleanBtn = document.getElementById('clean-btn');
const outputSection = document.getElementById('output-section');
const outputUrl = document.getElementById('output-url');
const copyBtn = document.getElementById('copy-btn');
const status = document.getElementById('status');
const infoToggle = document.getElementById('info-toggle');
const info = document.querySelector('.info');

// Clean button click handler
cleanBtn.addEventListener('click', () => {
    const input = inputUrl.value.trim();

    if (!input) {
        showStatus('Please enter an Instagram URL', true);
        outputSection.classList.remove('show');
        return;
    }

    try {
        const cleaned = cleanInstagramUrl(input);
        outputUrl.value = cleaned;
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

        // Visual feedback
        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyText.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (e) {
        // Fallback for older browsers
        outputUrl.select();
        document.execCommand('copy');
        showStatus('Copied to clipboard!');
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
