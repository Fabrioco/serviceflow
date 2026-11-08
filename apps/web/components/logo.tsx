export function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 text-lg font-semibold ${className}`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" fill="#0F766E" />
        <path
          d="M8 10h8M8 14h12M8 18h6"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      ServiceFlow
    </div>
  );
}
