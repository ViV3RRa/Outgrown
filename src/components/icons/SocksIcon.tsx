
interface SocksIconProps {
  className?: string;
  color?: string;
}

export function SocksIcon({ className = "w-4 h-4", color = "currentColor" }: SocksIconProps) {
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
      <path d="M8 2h6v8l-2 2v6a4 4 0 0 1-8 0v-2l4-4V2" />
      <path d="M8 2h6" />
      <path d="M8 6h6" />
    </svg>
  );
}