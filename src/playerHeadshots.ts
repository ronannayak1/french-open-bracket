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
  'learner tien': 'learner-tien.png',
  'rafael jodar': 'rafael-jodar.png',
  'lorenzo musetti': 'lorenzo-musetti.png',
  'flavio cobolli': 'flavio-cobolli.jpg',
  'alex de minaur': 'alex-de-minaur.png',
  'casper ruud': 'casper-ruud.jpg',
  'karen khachanov': 'karen-khachanov.png',
  'arthur fils': 'arthur-fils.jpg',
  'nishesh basavareddy': 'nishesh-basavareddy.png',
  'tommy paul': 'tommy-paul.png',
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function getPlayerHeadshot(playerName: string | undefined): string | null {
  if (!playerName) return null;
  const file = HEADSHOT_FILES[normalizeName(playerName)];
  return file ? `${BASE}${file}` : null;
}

export function getPlayerInitials(playerName: string): string {
  const parts = playerName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 3)
    .toUpperCase();
}
