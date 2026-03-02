/**
 * Shared iCalendar (RFC 5545) helpers.
 */

/** Convert an ISO date string or Date to iCal UTC format: YYYYMMDDTHHMMSSZ */
export function formatIcsDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

/** Escape text values for iCal property safety. */
export function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
