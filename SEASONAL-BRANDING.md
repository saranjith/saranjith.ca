# Seasonal branding
Original wordmark preserved in dist/assets/brand/original-wordmark.html and remains in page markup as fallback.
Decoration is layered beside it; remove seasonal-brand.js script references to restore the original.
Artwork: seasonal-decorations.png (transparent atlas, spring/summer/onam/autumn then halloween/diwali/winter/christmas).
Generated with built-in image generation from the approved rich concept: detailed botanical and festival clusters, transparent background, no lettering.

Toronto calendar: spring March–May, summer June–August, autumn September–November, winter December–February.
Festival overrides: Onam seven days before First Onam through Fourth Onam; Halloween Oct 24–31; Diwali two days before through festival day; Christmas Dec 1–25.
2026 First Onam Aug 25 (Kerala government calendar); Diwali Nov 8 (IIRS government holiday calendar). Sources are in seasonal-brand.js.
Add verified annual First Onam and Diwali dates to brandFestivalDates in dist/seasonal-brand.js each year. Unknown years deliberately use seasonal artwork instead of guessed lunar dates.
No dependencies or external date services. Dates refresh once per minute and when returning to an open tab.

Correction: the active artwork now uses exact CSS crops of seasonal-approved-original.png, preserving the approved complete lockups and their original light/dark backgrounds. seasonal-decorations.png is retained but unused. Original text and square remain stored in markup inside original-wordmark.
