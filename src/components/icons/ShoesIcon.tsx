
interface ShoesIconProps {
  className?: string;
  color?: string;
}

export function ShoesIcon({ className = "w-4 h-4", color = "currentColor" }: ShoesIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 18h16a2 2 0 0 1 2 2v1H2v-1a2 2 0 0 1 2-2z" />
      <path d="M6 18V8l2-4h6l2 4v10" />
      <path d="M8 8h8" />
    </svg>
  );
}