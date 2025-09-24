
interface UnderwearIconProps {
  className?: string;
  color?: string;
}

export function UnderwearIcon({ className = "w-4 h-4", color = "currentColor" }: UnderwearIconProps) {
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
      <path d="M6 8h12v4l-2 8h-8l-2-8V8z" />
      <path d="M6 8h12" />
      <path d="M9 12h6" />
    </svg>
  );
}