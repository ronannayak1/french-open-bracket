const BASE = `${import.meta.env.BASE_URL}headshots/`;

/** Normalized player name (lowercase) → image filename in public/headshots/ */
const HEADSHOT_FILES: Record<string, string> = {
  'novak djokovic': 'novak-djokovic.png',
  'daniil medvedev': 'daniil-medvedev.png',
  'alexander zverev': 'alexander-zverev.png',
  'carlos alcaraz': 'carlos-alcaraz.png',
  'ben shelton': 'ben-shelton.jpg',
  'felix auger-aliassime': 'felix-auger-aliassime.jpg',
  'frances tiafoe': 'frances-tiafoe.jpg',
  'taylor fritz': 'taylor-fritz.png',
  'jannik sinner': 'jannik-sinner.jpg',
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function getPlayerHeadshot(playerName: string | undefined): string | null {
  if (!playerName) return null;
  const file = HEADSHOT_FILES[normalizeName(playerName)];
  return file ? `${BASE}${file}` : null;
}
