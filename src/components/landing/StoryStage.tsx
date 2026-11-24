// The scroll story's one sticky stage. Pure function of props: the SVG holds
// every step's shapes at once, GSAP (in useStoryTimeline) moves them, and the
// HTML overlays switch on the step number.
import NumberFlow from '@number-flow/react'
import type { Reading } from '@/lib/fixtures'
import { deltaLabel } from '@/lib/format'
import { fractionOf, maxOf } from '@/lib/scale'
import { cn } from '@/lib/utils'
import { DecimalValue, Provenance } from './primitives'

export const VB = { w: 640, h: 560 }
export const BASE_Y = 470
const CHART_H = 330
const RUNG_X = [190, 340, 490]
export const LADDER = [
  { delta: 0, y: 470 },
  { delta: 0.5, y: 385 },
  { delta: 1, y: 300 },
  { delta: 10, y: 215 },
  { delta: 100, y: 130 },
]

export interface StageGeometry {
  xlmTops: { x: number; y: number }[]
  ustryTops: { x: number; y: number }[]
  limits: { key: 'liquidation' | 'manipulation'; label: string; value: string | null; width: number; y: number; isSafe: boolean }[]
}

export function stageGeometry(deep: Reading, thin: Reading, limitsFrom: Reading): StageGeometry {
  const all = [...deep.body.depth, ...thin.body.depth].map((d) => d.sellSide)
  const max = maxOf(all)
  const tops = (r: Reading, dx: number) =>
    r.body.depth.map((d, i) => ({ x: RUNG_X[i] + dx, y: BASE_Y - fractionOf(d.sellSide, max) * CHART_H }))
  const b = limitsFrom.body
  const present = [b.maxSafeCollateralLiquidation, b.maxSafeCollateralManipulation].filter((v): v is string => v !== null)
  const lmax = present.length ? maxOf(present) : '1'
  const row = (key: 'liquidation' | 'manipulation', label: string, value: string | null, y: number) => ({
    key,
    label,
    value,
    y,
    width: value === null ? 0 : fractionOf(value, lmax) * 440,
    isSafe: value !== null && value === b.maxSafeCollateral,
  })
  return {
    xlmTops: tops(deep, -26),
    ustryTops: tops(thin, 26),
    limits: [row('liquidation', 'Selling limit', b.maxSafeCollateralLiquidation, 190), row('manipulation', 'Manipulation limit', b.maxSafeCollateralManipulation, 320)],
  }
}

const pct = (x: number, total: number) => `${(x / total) * 100}%`

function Overlay({ on, className, style, children }: { on: boolean; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!on}
      className={cn('absolute transition-[opacity,transform] duration-500 ease-out', on ? 'opacity-100' : 'pointer-events-none translate-y-1 opacity-0', className)}
      style={style}
    >
      {children}
    </div>
  )
}

const OFFER_W = [46, 70, 58, 96, 124, 88, 150, 176]

export function StoryStage({
  step,
  rung,
  ladder,
  deep,
  thin,
  limitsFrom,
  geo,
}: {
  step: number
  rung: number
  ladder: number
  deep: Reading
  thin: Reading
  limitsFrom: Reading
  geo: StageGeometry
}) {
  const level = (r: Reading) => r.body.depth[rung]
  const provenanceFor = step === 0 ? [deep] : step === 2 ? [deep, thin] : step === 5 ? [limitsFrom] : []

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: `min(100%, calc(72vh * ${VB.w / VB.h}))` }}>
      <div className="relative" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="st-svg absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Story illustration for the current step">
          <defs>
            <linearGradient id="st-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-story-1)" />
              <stop offset="0.4" stopColor="var(--color-story-2)" />
              <stop offset="0.7" stopColor="var(--color-story-3)" />
              <stop offset="1" stopColor="var(--color-story-4)" />
            </linearGradient>
            <linearGradient id="st-grad-v" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--color-story-2)" />
              <stop offset="1" stopColor="var(--color-story-1)" />
            </linearGradient>
            <linearGradient id="st-grad-m" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--color-story-3)" />
              <stop offset="1" stopColor="var(--color-story-4)" />
            </linearGradient>
            <radialGradient id="st-dot" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.45" stopColor="var(--color-story-1)" />
              <stop offset="1" stopColor="var(--color-story-3)" />
            </radialGradient>
            <pattern id="st-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect width={VB.w} height={VB.h} fill="url(#st-grid)" rx="18" />
          <line x1="70" x2="610" y1={BASE_Y} y2={BASE_Y} stroke="rgba(255,255,255,0.14)" />

          {/* Step 2: offers stack behind the price */}
          <g className="st-offers">
            <path className="st-pool" d="M80 160 C 200 330, 250 360, 320 365 S 440 330, 560 160" fill="none" stroke="url(#st-grad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            {OFFER_W.map((w, i) => (
              <rect key={`b${i}`} className="st-bid" x={310 - w} y={300 + i * 20} width={w} height="12" rx="3" fill="url(#st-grad-v)" opacity={0.9 - i * 0.06} />
            ))}
            {OFFER_W.map((w, i) => (
              <rect key={`a${i}`} className="st-ask" x={330} y={300 + i * 20} width={w * 0.92} height="12" rx="3" fill="url(#st-grad-m)" opacity={0.9 - i * 0.06} />
            ))}
            <text x="90" y="292" fill="var(--color-faint)" fontSize="13">Order book</text>
            <text x="560" y="150" textAnchor="end" fill="var(--color-faint)" fontSize="13">Liquidity pool</text>
          </g>

          {/* Step 3: depth at the API's three rungs, sell side */}
          <g className="st-depth">
            {RUNG_X.map((x, i) => (
              <g key={x}>
                <rect x={x - 60} y={110} width={120} height={BASE_Y - 110} rx="10" fill="rgba(255,255,255,0.035)" className={cn('transition-opacity duration-300', i === rung ? 'opacity-100' : 'opacity-0')} />
                <text x={x} y={BASE_Y + 28} textAnchor="middle" fill={i === rung ? 'var(--color-ink)' : 'var(--color-faint)'} fontSize="14" fontFamily="var(--font-mono)">
                  {deltaLabel(deep.body.depth[i].delta)}
                </text>
              </g>
            ))}
            {geo.xlmTops.map((p, i) => (
              <rect key={`x${i}`} className="st-xbar" x={p.x - 20} y={p.y} width="40" height={BASE_Y - p.y} rx="5" fill="url(#st-grad-v)" />
            ))}
            {geo.ustryTops.map((p, i) => (
              <rect key={`u${i}`} className="st-ubar" x={p.x - 20} y={p.y} width="40" height={BASE_Y - p.y} rx="5" fill="url(#st-grad-m)" />
            ))}
            <text x="70" y={BASE_Y + 50} fill="var(--color-faint)" fontSize="13">Sell-side depth, {deep.body.quote.code}</text>
            <text x="610" y={BASE_Y + 50} textAnchor="end" fill="var(--color-faint)" fontSize="13">Price move</text>
          </g>

          {/* Step 4: a lending app trusts the price */}
          <g className="st-lend">
            <rect className="st-coll" x="130" y={BASE_Y - 260} width="120" height="260" rx="10" fill="url(#st-grad-v)" opacity="0.85" />
            <rect className="st-loan" x="390" y={BASE_Y - 190} width="120" height="190" rx="10" fill="url(#st-grad-m)" opacity="0.85" />
            <text x="190" y={BASE_Y + 28} textAnchor="middle" fill="var(--color-soft)" fontSize="14">Collateral value</text>
            <text x="450" y={BASE_Y + 28} textAnchor="middle" fill="var(--color-soft)" fontSize="14">Loan</text>
          </g>

          {/* Step 5: the manipulation ladder, 0.5x to 100x */}
          <g className="st-ladder">
            <line x1="320" x2="320" y1={LADDER[LADDER.length - 1].y} y2={BASE_Y} stroke="url(#st-grad-v)" strokeWidth="2" />
            {LADDER.slice(1).map((r, i) => (
              <g key={r.delta}>
                <line x1="300" x2="340" y1={r.y} y2={r.y} stroke={i + 1 <= ladder ? 'var(--color-story-1)' : 'rgba(255,255,255,0.25)'} strokeWidth="2" />
                <text x="356" y={r.y + 5} fill={i + 1 <= ladder ? 'var(--color-ink)' : 'var(--color-faint)'} fontSize="14" fontFamily="var(--font-mono)">
                  +{(r.delta * 100).toLocaleString('en-US')}%
                </text>
              </g>
            ))}
            <text x="284" y={BASE_Y + 5} textAnchor="end" fill="var(--color-faint)" fontSize="13">Price before</text>
          </g>

          {/* Step 6: the two limits, the lower one marked */}
          <g className="st-limits">
            {geo.limits.map((l) => (
              <g key={l.key}>
                {l.value === null ? (
                  <rect x="90" y={l.y} width="440" height="34" rx="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                ) : (
                  <rect className="st-limit" x="90" y={l.y} width={l.width} height="34" rx="8" fill={l.isSafe ? 'url(#st-grad)' : 'rgba(255,255,255,0.16)'} />
                )}
              </g>
            ))}
          </g>

          {/* The persistent price dot */}
          <g className="st-dot">
            <circle r="24" fill="none" stroke="var(--color-story-1)" strokeOpacity="0.35" />
            <circle r="13" fill="url(#st-dot)" />
          </g>
        </svg>

        {/* HTML overlays: real readings, set as text */}
        <Overlay on={step === 0} className="left-1/2 -translate-x-1/2 text-center" style={{ top: pct(120, VB.h) }}>
          <p className="text-sm text-faint">Mid price, {deep.body.asset.code}/{deep.body.quote.code}</p>
          <DecimalValue value={deep.body.midPrice} unit={deep.body.quote.code} className="text-[clamp(26px,4vw,40px)] tracking-tight" fracClassName="max-w-[12ch]" />
        </Overlay>

        <Overlay on={step === 2} className="left-[11%] right-[4%] flex flex-wrap gap-x-6 gap-y-2" style={{ top: pct(18, VB.h) }}>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-sm bg-[var(--color-story-1)]" />
            <span className="font-medium">{deep.body.asset.code}</span>
            <DecimalValue value={level(deep).sellSide} className="text-soft" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2.5 rounded-sm bg-[var(--color-story-4)]" />
            <span className="font-medium">{thin.body.asset.code}</span>
            <DecimalValue value={level(thin).sellSide} className="text-soft" />
          </div>
          <div className="ml-auto font-mono text-sm text-ink">
            at <NumberFlow value={Math.round(deep.body.depth[rung].delta * 100)} suffix="%" />
          </div>
        </Overlay>

        <Overlay on={step === 4} className="left-[6%] top-[6%]">
          <p className="text-sm text-faint">Price pushed up by</p>
          <p className="font-mono text-[clamp(30px,5vw,48px)] tracking-tight">
            <NumberFlow value={LADDER[ladder].delta * 100} prefix="+" suffix="%" format={{ useGrouping: true }} />
          </p>
        </Overlay>

        {geo.limits.map((l) => (
          <Overlay key={l.key} on={step === 5} className="left-[14%] right-[6%]" style={{ top: pct(l.y + 46, VB.h) }}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-sm text-soft">{l.label}</span>
              {l.value === null ? <span className="font-mono text-sm text-faint">unknown</span> : <DecimalValue value={l.value} unit={limitsFrom.body.quote.code} className="text-sm" />}
              {l.isSafe && <span className="text-sm font-medium text-[var(--color-story-1)]">Safe collateral size</span>}
            </div>
          </Overlay>
        ))}
      </div>

      <div className="mt-3 min-h-10 space-y-1">
        {provenanceFor.length === 0 && step > 0 && <p className="font-mono text-xs text-faint">Illustration. No reading is shown in this step.</p>}
        {provenanceFor.map((r) => (
          <Provenance key={r.body.asset.code} ledger={r.body.ledgerSeq} methodology={r.body.methodologyVersion} extra={<span className="text-soft">{r.body.asset.code}</span>} />
        ))}
      </div>
    </div>
  )
}
