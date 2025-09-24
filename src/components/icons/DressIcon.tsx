
interface DressIconProps {
  className?: string;
  color?: string;
}

export function DressIcon({ className = "w-4 h-4", color = "currentColor" }: DressIconProps) {
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
      <path d="M8 2h8v4l2 2v14H6V8l2-2V2z" />
      <path d="M8 4h8" />
      <path d="M6 8h12" />
    </svg>
  );
}