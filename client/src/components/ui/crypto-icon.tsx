interface CryptoIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function CryptoIcon({ src, alt, size = 8, className = "" }: CryptoIconProps) {
  return (
    <div
      className={`h-${size} w-${size} flex-shrink-0 ${className}`}
      aria-label={`${alt} logo`}
    >
      <img src={src} alt={alt} className="h-full w-full rounded-full" />
    </div>
  );
}

interface DualCryptoIconProps {
  src1: string;
  src2: string;
  alt1: string;
  alt2: string;
  size?: number;
}

export function DualCryptoIcon({
  src1,
  src2,
  alt1,
  alt2,
  size = 8
}: DualCryptoIconProps) {
  return (
    <div className={`flex -space-x-2 flex-shrink-0`}>
      <img
        className={`h-${size} w-${size} rounded-full ring-2 ring-white`}
        src={src1}
        alt={alt1}
      />
      <img
        className={`h-${size} w-${size} rounded-full ring-2 ring-white`}
        src={src2}
        alt={alt2}
      />
    </div>
  );
}
