
interface TshirtIconProps {
  className?: string;
  color?: string;
}

export function TshirtIcon({ className = "w-4 h-4", color = "currentColor" }: TshirtIconProps) {
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
      <path d="M8 2h8v2l3 1v4l-2 1v12H7V10l-2-1V5l3-1V2z" />
      <path d="M8 4h8" />
    </svg>
  );
}