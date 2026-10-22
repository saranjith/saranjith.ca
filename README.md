# Saranjith — personal website

Static HTML, CSS and JavaScript. The homepage contains Introduction, Approach, About, Tools and Contact.

## Favicon
### The Carrier - Carrying my roots forward.

The Carrier brings together two places that shape my story: Kerala and Canada. Its boat draws on the vallam and the canoe, joined in a single silhouette carried by a figure in motion.

The idea is personal: moving somewhere new doesn’t mean leaving your roots behind. You carry your experiences, culture, and perspective with you—and they shape what you create next.

The walking figure represents that ongoing journey. The purple accent gives the mark a distinctive point of recognition, while the bold silhouette and restrained detail lend it a timeless, slightly retro character.

For my portfolio, The Carrier is a reminder that my work moves forward with everything I bring to it.

## Preview
Run `npm run preview` and open http://127.0.0.1:4174/.
The Python server previews files only; Vercel redirects, headers, analytics endpoints and custom 404 status handling require a Vercel deployment.

## Edit
- `dist/index.html`: homepage, static career timeline and metadata.
- `dist/style.css`: shared appearance and responsive layout.
- `dist/app.js`: theme controls and current year.
- `dist/content.json`: reference career data; update the homepage timeline when changing it.
- `dist/humane.html`, `dist/case-study.css`, `dist/case-study.js`: deferred 2020 design exercise and accessible image viewer.
- `dist/social-preview.png`: 1200 × 630 social preview.

The case study remains available by direct URL, is marked noindex, and is excluded from the sitemap. Restore its homepage link and remove noindex when ready to publish it. Original deferred work remains in `archive/`, outside the published output.

## Hosting
Connect Vercel to `main` with the repository root as Root Directory. `vercel.json` declares no framework, no build command, and `dist` as Output Directory. Only `dist/` should be served. Use HTTPS and the canonical domain `saranjith.ca`; www and /index.html redirect permanently. There is no catch-all homepage rewrite; missing files must return 404 using `dist/404.html`.

## Analytics
Both public HTML pages include the static Vercel Web Analytics queue and deferred first-party script at `/_vercel/insights/script.js`. No npm analytics package or bundler is needed. Enable Web Analytics in the Vercel dashboard and redeploy. Verify a page-view request and dashboard data using a clean browser profile; local Python previews cannot validate analytics.

## Security headers
`vercel.json` keeps the existing headers and adds a `Permissions-Policy` that disables camera, microphone and geolocation. Its Content Security Policy is **report-only**. It reports potential violations without blocking site behavior; do not change it to `Content-Security-Policy` until the deployed checks below pass. There is no reporting endpoint configured yet, so inspect browser console violations on the deployed pages.

The policy covers the actual resources in `dist/index.html`, `dist/humane.html` and `dist/404.html`: local scripts, images, styles and manifest; Google Fonts; Google Analytics `G-X45XH65BPH` via Google Tag Manager; Vercel Web Analytics and Speed Insights through first-party `/_vercel/` routes; and Speed Insights' `vitals.vercel-insights.com` fallback. Google Analytics collection origins follow Google's no-Ads guidance. The homepage uses inline style attributes for its artwork, so styles currently allow `'unsafe-inline'`; scripts do **not** allow `'unsafe-inline'` or `'unsafe-eval'`. The six `sha256-` entries are calculated from the exact UTF-8 bytes between each inline `<script>` tag, including JSON-LD. Whitespace changes alter a hash.

After editing inline scripts or resource URLs, update the report-only policy and run `python3 scripts/check-security-policy.py`. That checker verifies the exact inline-script hashes, declared static resources, local asset existence and known analytics/font destinations across all three pages. It cannot reproduce Vercel response headers or third-party runtime requests in the local Python preview.

Before enforcement, deploy to a preview environment and inspect the **response headers** and browser CSP reports on `/`, `/humane.html` and a real missing URL that serves `404.html`. Check light and dark themes, the theme toggle, hero/process animations, case-study image viewer, Google Fonts, GA page-view requests and dashboard data, Vercel Web Analytics and Speed Insights requests and dashboard data. Test in a clean browser without blocking extensions. Resolve or deliberately allow any relevant violations, then repeat on production. Keep the case study's `noindex` and sitemap exclusion intact. Only after the report-only policy is clean and analytics are confirmed should it be considered for enforcement.

Production static responses currently include `Access-Control-Allow-Origin: *`, although this repository does not set that header. The site serves public static content and has no credentialed API endpoint, so this change leaves that behavior untouched; revisit it if private or credentialed responses are added.

## Release checks
- Confirm the production deployment uses the expected main commit.
- Check /, /humane.html, stylesheet and script content types, /index.html, www redirects and a nonexistent URL.
- Confirm /archive/content.json and /package.json return 404.
- Check keyboard order, skip link, theme toggle, dialog Escape/close/focus return, and 200% zoom.
- Run Lighthouse without extensions for mobile and desktop, in light and dark themes, including the case study. Compare medians of three runs.
- Validate sitemap, canonical metadata, structured data and social previews.
