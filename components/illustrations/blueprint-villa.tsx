// Original architect-style elevation of a modern two-storey villa, with dimension lines
// and a faint grid. Strokes in currentColor; decorative only.

export function BlueprintVilla({ className }: { className?: string }) {
  const tick = (x: number, y: number, vertical = false) =>
    vertical ? <line x1={x - 5} x2={x + 5} y1={y} y2={y} /> : <line x1={x} x2={x} y1={y - 5} y2={y + 5} />
  return (
    <svg viewBox="0 0 640 420" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className={`ak-line-art ${className ?? ''}`} aria-hidden focusable="false">
      {/* Drafting grid */}
      <g opacity={0.12} strokeWidth={1}>
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} x2={i * 40} y1={0} y2={420} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1={0} x2={640} y1={i * 40} y2={i * 40} />
        ))}
      </g>

      {/* Ground and slab */}
      <line x1={40} x2={600} y1={340} y2={340} />
      <line x1={70} x2={570} y1={348} y2={348} opacity={0.5} strokeDasharray="6 6" />

      {/* Ground floor with full-height glazing */}
      <rect x={110} y={230} width={300} height={110} />
      {[160, 210, 260, 310, 360].map((x) => (
        <line key={x} x1={x} x2={x} y1={236} y2={340} opacity={0.6} />
      ))}
      <line x1={110} x2={410} y1={290} y2={290} opacity={0.35} />
      {/* Door */}
      <rect x={430} y={262} width={46} height={78} />
      <line x1={468} x2={468} y1={298} y2={306} />
      <rect x={410} y={230} width={90} height={110} opacity={0.6} />

      {/* Cantilevered upper floor with louvres */}
      <rect x={180} y={140} width={360} height={90} />
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={i} x1={300 + i * 18} x2={300 + i * 18} y1={148} y2={222} opacity={0.55} />
      ))}
      <rect x={196} y={156} width={88} height={58} opacity={0.8} />
      <line x1={240} x2={240} y1={156} y2={214} opacity={0.5} />
      {/* Roof slab and parapet */}
      <line x1={168} x2={556} y1={132} y2={132} strokeWidth={2.2} />
      <line x1={168} x2={168} y1={132} y2={140} />
      <line x1={556} x2={556} y1={132} y2={140} />

      {/* Balcony rail */}
      <line x1={410} x2={540} y1={230} y2={230} strokeWidth={2} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={414 + i * 15} x2={414 + i * 15} y1={206} y2={230} opacity={0.5} />
      ))}
      <line x1={410} x2={540} y1={206} y2={206} opacity={0.7} />

      {/* Tree and planter */}
      <circle cx={585} cy={270} r={26} opacity={0.8} />
      <circle cx={570} cy={290} r={16} opacity={0.6} />
      <line x1={585} x2={585} y1={296} y2={340} />
      <rect x={60} y={318} width={36} height={22} opacity={0.7} />
      <path d="M66,318 C70,300 76,300 78,318 M80,318 C84,296 92,298 90,318" opacity={0.7} />

      {/* Dimension lines */}
      <g opacity={0.7} strokeWidth={1}>
        <line x1={110} x2={500} y1={382} y2={382} />
        {tick(110, 382)}
        {tick(500, 382)}
        <line x1={110} x2={110} y1={348} y2={388} strokeDasharray="2 4" />
        <line x1={500} x2={500} y1={348} y2={388} strokeDasharray="2 4" />
        <line x1={612} x2={612} y1={132} y2={340} />
        {tick(612, 132, true)}
        {tick(612, 340, true)}
      </g>
      <g fill="currentColor" stroke="none" fontFamily="var(--font-sans), sans-serif" fontSize={13} opacity={0.75}>
        <text x={305} y={402} textAnchor="middle">
          14.60 m
        </text>
        <text x={626} y={240} transform="rotate(90 626 240)" textAnchor="middle">
          7.20 m
        </text>
        <text x={40} y={34}>
          Elevation, south
        </text>
        <text x={40} y={52} opacity={0.7}>
          Scale 1:100
        </text>
      </g>
    </svg>
  )
}
