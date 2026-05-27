/** Build PDF-style abbrev: JM.CERUNDOLO from "Juan Manuel CERUNDOLO" */
export function playerToAbbrev(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1]!;
  const initials = parts
    .slice(0, -1)
    .map((p) => p.replace(/[^A-Za-z]/g, '')[0])
    .filter(Boolean)
    .join('');
  return `${initials}.${last}`;
}

export function normalizeAbbrevKey(abbrev: string): string {
  return abbrev
    .replace(/\s+\[\d+\]/, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

export function abbrevMatchesPlayer(abbrev: string, fullName: string): boolean {
  const key = normalizeAbbrevKey(abbrev);
  const primary = normalizeAbbrevKey(playerToAbbrev(fullName));
  if (key === primary) return true;
  // Allow first-initial-only variant (J.CERUNDOLO vs JM.CERUNDOLO)
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 2) {
    const short = normalizeAbbrevKey(
      `${parts[0]![0]}.${parts[parts.length - 1]}`
    );
    if (key === short) return true;
  }
  return false;
}
