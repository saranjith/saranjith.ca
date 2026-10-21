/* Dates use Toronto calendar days, independent of a visitor's time zone.
   Verify new years before adding them; never reuse lunar dates across years.
   2026: https://kerala.gov.in/assets/public_uploads/public_holiday_2026.pdf
   https://www.iirs.gov.in/holidaycalender */
const brandFestivalDates = {2026: {firstOnam: '2026-08-25', diwali: '2026-11-08'}};
function shiftBrandDate(iso, days) {
  const date = new Date(iso + 'T12:00:00Z');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function seasonalBrandForDate(iso) {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const between = (start, end) => iso >= start && iso <= end;
  const dates = brandFestivalDates[year];
  if (dates && between(shiftBrandDate(dates.firstOnam, -7), shiftBrandDate(dates.firstOnam, 3))) return 'onam';
  if (between(`${year}-10-24`, `${year}-10-31`)) return 'halloween';
  if (dates && between(shiftBrandDate(dates.diwali, -2), dates.diwali)) return 'diwali';
  if (between(`${year}-12-01`, `${year}-12-25`)) return 'christmas';
  return month >= 3 && month <= 5 ? 'spring' : month >= 6 && month <= 8 ? 'summer' : month >= 9 && month <= 11 ? 'autumn' : 'winter';
}
if (typeof document !== 'undefined') {
  const refreshSeasonalBrand = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Toronto', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type).value;
    const season = seasonalBrandForDate(`${value('year')}-${value('month')}-${value('day')}`);
    document.querySelectorAll('a.wordmark').forEach(mark => {
      mark.dataset.season = season;
      if (!mark.querySelector('.seasonal-decoration')) {
        const decoration = document.createElement('span');
        decoration.className = 'seasonal-decoration';
        const original = document.createElement('span');
        original.className = 'original-wordmark';
        while (mark.firstChild) original.append(mark.firstChild);
        mark.append(original);
        decoration.setAttribute('aria-hidden', 'true');
        mark.append(decoration);
      }
    });
  };
  refreshSeasonalBrand();
  // Refresh after midnight or when returning to a tab left open overnight.
  setInterval(refreshSeasonalBrand, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSeasonalBrand(); });
}
if (typeof module !== 'undefined') module.exports = {seasonalBrandForDate};
