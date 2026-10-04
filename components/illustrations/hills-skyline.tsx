// Original line illustration: Rwanda's terraced hills with homes, apartments and towers
// stepping up the ridges. Pure SVG, strokes in currentColor, so it takes any tint and
// works in light and dark mode. Decorative only (aria-hidden by the caller).

const W = 1440
const H = 360

type Building =
  | { kind: 'house'; x: number; base: number; w: number; h: number }
  | { kind: 'block'; x: number; base: number; w: number; h: number; floors: number }
  | { kind: 'tower'; x: number; base: number; w: number; h: number }
  | { kind: 'dome'; x: number; base: number; w: number }
  | { kind: 'tree'; x: number; base: number; r: number }
  | { kind: 'palm'; x: number; base: number; h: number }

// Ridge heights: the middle hill rises towards the right, so buildings step up the slope.
const ridge = (x: number) => 250 - 70 * Math.sin((x / W) * Math.PI * 0.95 + 0.3) - 18 * Math.sin((x / W) * Math.PI * 3.2)

const BUILDINGS: Building[] = [
  { kind: 'tree', x: 40, base: ridge(40), r: 14 },
  { kind: 'house', x: 70, base: ridge(70), w: 58, h: 30 },
  { kind: 'house', x: 140, base: ridge(140), w: 46, h: 26 },
  { kind: 'palm', x: 200, base: ridge(200), h: 52 },
  { kind: 'block', x: 230, base: ridge(230), w: 70, h: 78, floors: 5 },
  { kind: 'house', x: 315, base: ridge(315), w: 52, h: 28 },
  { kind: 'tree', x: 385, base: ridge(385), r: 12 },
  { kind: 'block', x: 410, base: ridge(410), w: 56, h: 104, floors: 7 },
  { kind: 'tower', x: 480, base: ridge(480), w: 34, h: 170 },
  { kind: 'block', x: 528, base: ridge(528), w: 64, h: 88, floors: 6 },
  { kind: 'dome', x: 610, base: ridge(610), w: 120 },
  { kind: 'tower', x: 745, base: ridge(745), w: 30, h: 205 },
  { kind: 'tower', x: 785, base: ridge(785), w: 40, h: 150 },
  { kind: 'block', x: 838, base: ridge(838), w: 72, h: 96, floors: 6 },
  { kind: 'palm', x: 925, base: ridge(925), h: 56 },
  { kind: 'house', x: 950, base: ridge(950), w: 60, h: 32 },
  { kind: 'block', x: 1025, base: ridge(1025), w: 58, h: 70, floors: 4 },
  { kind: 'tree', x: 1100, base: ridge(1100), r: 15 },
  { kind: 'house', x: 1125, base: ridge(1125), w: 54, h: 30 },
  { kind: 'house', x: 1195, base: ridge(1195), w: 48, h: 26 },
  { kind: 'tree', x: 1262, base: ridge(1262), r: 12 },
  { kind: 'block', x: 1285, base: ridge(1285), w: 62, h: 64, floors: 4 },
  { kind: 'house', x: 1362, base: ridge(1362), w: 56, h: 28 },
]

function hillPath(offset: number, amp: number, freq: number, phase: number) {
  const pts: string[] = []
  for (let x = 0; x <= W; x += 24) {
    const y = offset - amp * Math.sin((x / W) * Math.PI * freq + phase) - (amp / 4) * Math.sin((x / W) * Math.PI * freq * 3.1 + phase)
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

function ridgePath() {
  const pts: string[] = []
  for (let x = 0; x <= W; x += 16) pts.push(`${x},${ridge(x).toFixed(1)}`)
  return `M${pts.join(' L')}`
}

function House({ x, base, w, h }: { x: number; base: number; w: number; h: number }) {
  const top = base - h
  const roof = top - h * 0.55
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} />
      <path d={`M${x - 4},${top} L${x + w / 2},${roof} L${x + w + 4},${top}`} />
      <rect x={x + w * 0.42} y={base - h * 0.62} width={w * 0.16} height={h * 0.62} opacity={0.7} />
      <rect x={x + w * 0.12} y={top + h * 0.25} width={w * 0.18} height={h * 0.28} opacity={0.6} />
      <rect x={x + w * 0.7} y={top + h * 0.25} width={w * 0.18} height={h * 0.28} opacity={0.6} />
    </g>
  )
}

function Block({ x, base, w, h, floors }: { x: number; base: number; w: number; h: number; floors: number }) {
  const top = base - h
  const step = h / floors
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} />
      <line x1={x - 3} y1={top} x2={x + w + 3} y2={top} />
      {Array.from({ length: floors - 1 }).map((_, i) => (
        <line key={i} x1={x} x2={x + w + 6} y1={top + step * (i + 1)} y2={top + step * (i + 1)} opacity={0.55} />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={x + w * f} x2={x + w * f} y1={top + 4} y2={base - 4} opacity={0.3} />
      ))}
    </g>
  )
}

function Tower({ x, base, w, h }: { x: number; base: number; w: number; h: number }) {
  const top = base - h
  return (
    <g>
      <path d={`M${x},${base} L${x},${top + 10} L${x + w / 2},${top} L${x + w},${top + 10} L${x + w},${base}`} />
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1={x + (w / 5) * (i + 1)} x2={x + (w / 5) * (i + 1)} y1={top + 14} y2={base} opacity={0.4} />
      ))}
      <line x1={x + w / 2} x2={x + w / 2} y1={top} y2={top - 18} />
    </g>
  )
}

function Dome({ x, base, w }: { x: number; base: number; w: number }) {
  const r = w / 2
  const cx = x + r
  const ringY = base - 26
  return (
    <g>
      <rect x={x + 6} y={ringY} width={w - 12} height={26} />
      <path d={`M${x},${ringY} A${r},${r * 0.95} 0 0 1 ${x + w},${ringY}`} />
      {[0.35, 0.65].map((f) => (
        <path key={f} d={`M${x + w * (0.5 - f / 2)},${ringY} A${r * f},${r * 0.95} 0 0 1 ${x + w * (0.5 + f / 2)},${ringY}`} opacity={0.5} />
      ))}
      <line x1={cx} x2={cx} y1={ringY - r * 0.95} y2={ringY} opacity={0.5} />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={x + 12 + i * ((w - 24) / 6)} x2={x + 12 + i * ((w - 24) / 6)} y1={ringY + 4} y2={base} opacity={0.4} />
      ))}
    </g>
  )
}

function Tree({ x, base, r }: { x: number; base: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={base - r * 1.9} r={r} />
      <line x1={x} x2={x} y1={base - r * 0.9} y2={base} />
    </g>
  )
}

function Palm({ x, base, h }: { x: number; base: number; h: number }) {
  const top = base - h
  return (
    <g>
      <path d={`M${x},${base} Q${x + 4},${base - h / 2} ${x + 2},${top}`} />
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${x + 2},${top} Q${x + d * 14},${top - 10} ${x + d * 24},${top + 6}`} />
          <path d={`M${x + 2},${top} Q${x + d * 10},${top - 2} ${x + d * 18},${top + 14}`} />
        </g>
      ))}
    </g>
  )
}

export function HillsSkyline({ className, strokeWidth = 1.25 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={`ak-line-art ${className ?? ''}`} aria-hidden focusable="false">
      {/* Distant hills and the sun */}
      <circle cx={1150} cy={88} r={42} opacity={0.35} />
      <path d={hillPath(210, 46, 2.2, 0.9)} opacity={0.3} />
      <path d={hillPath(232, 38, 1.6, 2.4)} opacity={0.4} />
      {/* Terraces on the near hill */}
      {[18, 36, 54, 72].map((d) => (
        <path key={d} d={hillPath(318 + d * 0.4, 30 - d * 0.18, 1.3, 1.1)} strokeDasharray="2 7" opacity={0.45} />
      ))}
      {/* The ridge the city sits on */}
      <path d={ridgePath()} opacity={0.75} />
      {BUILDINGS.map((b, i) => {
        switch (b.kind) {
          case 'house':
            return <House key={i} {...b} />
          case 'block':
            return <Block key={i} {...b} />
          case 'tower':
            return <Tower key={i} {...b} />
          case 'dome':
            return <Dome key={i} {...b} />
          case 'tree':
            return <Tree key={i} {...b} />
          case 'palm':
            return <Palm key={i} {...b} />
        }
      })}
      <line x1={0} x2={W} y1={H - 1} y2={H - 1} opacity={0.5} />
    </svg>
  )
}
