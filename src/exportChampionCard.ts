import { logoSrc } from './components/BrandLogo';

export interface ChampionCardOptions {
  winnerName: string;
  headshotSrc?: string | null;
  bracketName?: string;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const COLORS = {
  bgTop: '#0c1018',
  bgBottom: '#121a24',
  accent: '#3c638e',
  accentLight: '#5580ad',
  green: '#6c935c',
  gold: '#d4b84a',
  text: '#e8ecf4',
  textMuted: '#8a9bb0',
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export async function renderChampionCardBlob(
  options: ChampionCardOptions
): Promise<Blob> {
  const { winnerName, headshotSrc, bracketName } = options;
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, COLORS.bgTop);
  gradient.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(0, 0, CARD_WIDTH, 10);

  const logo = await loadImage(logoSrc());
  const logoHeight = 120;
  const logoWidth = (logo.width / logo.height) * logoHeight;
  ctx.drawImage(
    logo,
    (CARD_WIDTH - logoWidth) / 2,
    72,
    logoWidth,
    logoHeight
  );

  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = '600 34px Inter, system-ui, sans-serif';
  ctx.fillText('US OPEN 2026', CARD_WIDTH / 2, 240);
  ctx.fillStyle = COLORS.accentLight;
  ctx.font = '800 52px Inter, system-ui, sans-serif';
  ctx.fillText('BRACKET CHALLENGE', CARD_WIDTH / 2, 300);

  const photoX = 90;
  const photoY = 360;
  const photoW = CARD_WIDTH - 180;
  const photoH = 720;
  const radius = 28;

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, radius);
  ctx.clip();
  ctx.fillStyle = '#18202c';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (headshotSrc) {
    try {
      const headshot = await loadImage(headshotSrc);
      drawCoverImage(ctx, headshot, photoX, photoY, photoW, photoH);
    } catch {
      drawPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, winnerName);
    }
  } else {
    drawPhotoPlaceholder(ctx, photoX, photoY, photoW, photoH, winnerName);
  }
  ctx.restore();

  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 4;
  roundRect(ctx, photoX, photoY, photoW, photoH, radius);
  ctx.stroke();

  ctx.fillStyle = COLORS.gold;
  ctx.font = '700 38px Inter, system-ui, sans-serif';
  ctx.fillText('MY CHAMPION PICK', CARD_WIDTH / 2, 1140);

  ctx.fillStyle = COLORS.text;
  ctx.font = '900 64px Inter, system-ui, sans-serif';
  const nameLines = wrapText(ctx, winnerName, CARD_WIDTH - 120);
  let nameY = 1210;
  for (const line of nameLines) {
    ctx.fillText(line, CARD_WIDTH / 2, nameY);
    nameY += 72;
  }

  if (bracketName?.trim()) {
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '600 32px Inter, system-ui, sans-serif';
    ctx.fillText(bracketName.trim(), CARD_WIDTH / 2, 1290);
  }

  ctx.fillStyle = COLORS.green;
  ctx.font = '600 28px Inter, system-ui, sans-serif';
  ctx.fillText('🏆', CARD_WIDTH / 2, bracketName?.trim() ? 1330 : 1310);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      'image/png'
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  winnerName: string
) {
  const initials = winnerName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  ctx.fillStyle = '#1f2a38';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.accentLight;
  ctx.font = '900 180px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x + w / 2, y + h / 2);
  ctx.textBaseline = 'alphabetic';
}

export function downloadChampionCard(blob: Blob, winnerName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `us-open-2026-champion-${slugify(winnerName)}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareChampionCard(
  blob: Blob,
  winnerName: string
): Promise<'shared' | 'downloaded'> {
  const file = new File(
    [blob],
    `us-open-2026-champion-${slugify(winnerName)}.png`,
    { type: 'image/png' }
  );

  if (navigator.share) {
    const payload: ShareData = {
      title: `My US Open 2026 champion: ${winnerName}`,
      text: `I picked ${winnerName} to win the 2026 US Open!`,
    };
    if (navigator.canShare?.({ ...payload, files: [file] })) {
      await navigator.share({ ...payload, files: [file] });
      return 'shared';
    }
    if (navigator.canShare?.(payload)) {
      await navigator.share(payload);
      downloadChampionCard(blob, winnerName);
      return 'shared';
    }
  }

  downloadChampionCard(blob, winnerName);
  return 'downloaded';
}
