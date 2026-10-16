/**
 * Brand mark: the Rock of Gibraltar rising from an envelope whose open corner becomes a tick.
 * The second path is a knockout stroke and must match the colour behind the mark.
 */
export function LogoMark({ size = 32, knockout = "#FAF8F5" }: { size?: number; knockout?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M5 32L8 31L11 20L13 13L15 10L18 11L21 10L25 11L30 13L35 16L41 21L46 25L42 32Z" fill="#DA000C" />
      <path d="M14 40l12 9L59 15" stroke={knockout} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M38 32H11a5 5 0 0 0-5 5v16a5 5 0 0 0 5 5h41a5 5 0 0 0 5-5V42"
        stroke="#DA000C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 40l12 9L59 15" stroke="#DA000C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
