const NAME_PARTICLES = new Set([
  'DE',
  'DA',
  'DEL',
  'DI',
  'DU',
  'LA',
  'LE',
  'VAN',
  'VON',
  'ST',
  'SAN',
  'MC',
  'MAC',
]);

/** Build PDF-style abbrev: A.DE MINAUR, JM.CERUNDOLO, F.AUGER-ALIASSIME */
export function playerToAbbrev(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!;

  let lastStart = parts.length - 1;
  for (let i = parts.length - 2; i >= 1; i--) {
    const p = parts[i]!.toUpperCase();
    if (NAME_PARTICLES.has(p)) {
      lastStart = i;
    } else {
      break;
    }
  }

  const lastName = parts.slice(lastStart).join(' ');
  const initials = parts
    .slice(0, lastStart)
    .map((p) => p.replace(/[^A-Za-z]/g, '')[0])
    .filter(Boolean)
    .join('');

  return `${initials}.${lastName}`;
}

export function normalizeAbbrevKey(abbrev: string): string {
  return abbrev
    .replace(/\s+\[\d+\]/, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/** All abbrev variants likely used in Wimbledon PDFs */
export function abbrevVariantsForPlayer(fullName: string): string[] {
  const variants = new Set<string>();
  const primary = playerToAbbrev(fullName);
  variants.add(normalizeAbbrevKey(primary));

  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]!;
    variants.add(normalizeAbbrevKey(`${parts[0]![0]}.${last}`));
  }
  if (parts.length >= 3) {
    const last = parts[parts.length - 1]!;
    const allInitials = parts
      .slice(0, -1)
      .map((p) => p[0])
      .join('');
    variants.add(normalizeAbbrevKey(`${allInitials}.${last}`));
  }

  return [...variants];
}

export function abbrevMatchesPlayer(abbrev: string, fullName: string): boolean {
  const key = normalizeAbbrevKey(abbrev);
  return abbrevVariantsForPlayer(fullName).includes(key);
}

/** Search tokens for opponent in PDF text window */
export function opponentSearchTokens(fullName: string): string[] {
  const parts = fullName.trim().split(/\s+/);
  const tokens = new Set<string>();
  tokens.add(normalizeAbbrevKey(playerToAbbrev(fullName)));
  if (parts.length >= 2) {
    tokens.add(parts[parts.length - 1]!.toUpperCase());
    tokens.add(
      normalizeAbbrevKey(`${parts[0]![0]}.${parts[parts.length - 1]}`)
    );
  }
  for (const p of parts) {
    if (p.length > 2) tokens.add(p.toUpperCase());
  }
  return [...tokens];
}
