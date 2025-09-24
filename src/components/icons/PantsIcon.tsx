
interface PantsIconProps {
  className?: string;
  color?: string;
}

export function PantsIcon({ className = "w-4 h-4", color = "currentColor" }: PantsIconProps) {
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
      <path d="M8 2h8v12l-2 8h-2l-1-8h-2l-1 8H6l-2-8V2z" />
      <path d="M8 2h8" />
      <path d="M10 14h4" />
    </svg>
  );
}