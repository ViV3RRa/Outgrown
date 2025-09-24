
interface BodyIconProps {
  className?: string;
  color?: string;
}

export function BodyIcon({ className = "w-4 h-4", color = "currentColor" }: BodyIconProps) {
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
      {/* Baby body/onesie shape */}
      <path d="M7 4h10c1 0 2 1 2 2v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6c0-1 1-2 2-2z" />
      <path d="M9 8h6" />
      <path d="M10 12h4" />
      <path d="M7 16l2 2h6l2-2" />
      {/* Snap closures at bottom */}
      <circle cx="10" cy="18" r="0.5" />
      <circle cx="12" cy="18" r="0.5" />
      <circle cx="14" cy="18" r="0.5" />
    </svg>
  );
}