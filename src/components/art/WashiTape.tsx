interface Props {
  position: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
}

export default function WashiTape({ position, className = '' }: Props) {
  return (
    <div
      className={`washi-tape washi-tape-${position} ${className}`}
      aria-hidden="true"
    />
  );
}