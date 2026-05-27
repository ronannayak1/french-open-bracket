const LOGO_SRC = `${import.meta.env.BASE_URL}roland-garros-logo.png`;

interface BrandLogoProps {
  /** Visual size in CSS pixels (width & height). */
  size?: number;
  className?: string;
  /** Short label for screen readers when the logo is decorative alongside text. */
  alt?: string;
}

export function logoSrc(): string {
  return LOGO_SRC;
}

export default function BrandLogo({
  size = 40,
  className = '',
  alt = 'Roland-Garros',
}: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`brand-logo ${className}`.trim()}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
