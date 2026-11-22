/** Two overlapping coins: one bill, shared. */
export default function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <circle cx="12" cy="16" r="9" className="logo-a" />
      <circle cx="20" cy="16" r="9" className="logo-b" />
    </svg>
  );
}
