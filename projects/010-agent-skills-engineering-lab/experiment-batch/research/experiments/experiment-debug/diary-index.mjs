// Deliberately simplified, fictitious diary/index model; no real user data.
export const entries = [
  { id: 'old', date: '2026-10-27', text: '青色风筝' },
  { id: 'today', date: '2026-10-28', text: '橙色纸船' },
];

// Reconstructed faulty version: a daily rebuild filters out older records.
export function buildBefore(records, today) {
  return records.filter((record) => record.date === today);
}

// Rebuild from all authoritative records, rather than only today's records.
export function buildAfter(records) {
  return records.slice();
}

export function search(index, query) {
  return index.filter((record) => record.text.includes(query)).map((record) => record.id);
}
