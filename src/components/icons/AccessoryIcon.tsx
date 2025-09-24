
interface AccessoryIconProps {
  className?: string;
  color?: string;
}

export function AccessoryIcon({ className = "w-4 h-4", color = "currentColor" }: AccessoryIconProps) {
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
      <circle cx="12" cy="8" r="6" />
      <path d="M8 14v2a4 4 0 0 0 8 0v-2" />
      <path d="M10 10h4" />
      <path d="M10 6h4" />
    </svg>
  );
}