const LOGO_SRC = `${import.meta.env.BASE_URL}roland-garros-logo.png`;

/** Source image is 1024×682 */
const LOGO_ASPECT = 1024 / 682;

interface BrandLogoProps {
  /** Display height in CSS pixels; width follows image aspect ratio. */
  height?: number;
  className?: string;
  alt?: string;
}

export function logoSrc(): string {
  return LOGO_SRC;
}

export default function BrandLogo({
  height = 40,
  className = '',
  alt = 'Roland-Garros',
}: BrandLogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`brand-logo ${className}`.trim()}
      width={width}
      height={height}
      style={{ height: `${height}px`, width: 'auto' }}
      decoding="async"
    />
  );
}
