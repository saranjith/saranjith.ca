# Saranjith — personal website

Static HTML, CSS and JavaScript. The homepage contains Introduction, Approach, About, Tools and Contact.

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

## Release checks
- Confirm the production deployment uses the expected main commit.
- Check /, /humane.html, stylesheet and script content types, /index.html, www redirects and a nonexistent URL.
- Confirm /archive/content.json and /package.json return 404.
- Check keyboard order, skip link, theme toggle, dialog Escape/close/focus return, and 200% zoom.
- Run Lighthouse without extensions for mobile and desktop, in light and dark themes, including the case study. Compare medians of three runs.
- Validate sitemap, canonical metadata, structured data and social previews.
