
interface JacketIconProps {
  className?: string;
  color?: string;
}

export function JacketIcon({ className = "w-4 h-4", color = "currentColor" }: JacketIconProps) {
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
      <path d="M6 2h12v2l4 2v4l-3 1v11H5V11l-3-1V6l4-2V2z" />
      <path d="M6 4h12" />
      <path d="M8 8h8" />
      <path d="M10 12v8" />
      <path d="M14 12v8" />
    </svg>
  );
}