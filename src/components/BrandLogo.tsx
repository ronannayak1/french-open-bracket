const LOGO_SRC = `${import.meta.env.BASE_URL}wimbledon-logo.svg`;

/** Source image is 320×80 */
const LOGO_ASPECT = 320 / 80;

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
  alt = 'Wimbledon',
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
