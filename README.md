# Instagram Link Cleaner

A simple web tool that removes tracking parameters from Instagram links, giving you clean, shareable URLs.

## What It Does

Strips tracking parameters from Instagram URLs:

- `igsh` / `igshid` - Instagram share tracking
- `utm_*` - Marketing/campaign tracking
- `fbclid` - Facebook click tracking
- Other common tracking params

### Example

**Input:**
```
https://www.instagram.com/p/ABC123/?igsh=xyz789&utm_source=ig_web
```

**Output:**
```
https://www.instagram.com/p/ABC123/
```

## Features

- Works with posts, reels, stories, and profiles
- One-click copy to clipboard
- Entirely client-side (no data sent to any server)
- Mobile-friendly design

## Usage

1. Paste an Instagram link
2. Click "Clean Link"
3. Copy the cleaned URL

## Tech Stack

- Pure HTML, CSS, JavaScript
- No frameworks or dependencies
- Static hosting (Netlify)

## Local Development

Just open `index.html` in a browser. No build step required.

## Deploy

Connect this repo to Netlify for automatic deployments on push.
