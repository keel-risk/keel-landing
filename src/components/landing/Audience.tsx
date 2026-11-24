// Section 5. Illustrative: shapes, labels and band tokens only. Bands limited
// to LOW and CRITICAL, the two names the illustration rules allow.
import { BandIcon, SectionHead } from './primitives'
import type { Band } from '@/lib/fixtures'

const ROWS: Band[] = ['LOW', 'CRITICAL', 'LOW', 'LOW']
const STRIP: Band[] = ['LOW', 'LOW', 'LOW', 'CRITICAL', 'CRITICAL', 'LOW', 'LOW', 'LOW', 'LOW', 'CRITICAL', 'LOW', 'LOW']

function PoolCreators() {
  return (
    <div className="space-y-2">
      {ROWS.map((b, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-line bg-raised px-3 py-2.5">
          <div className="h-3 rounded bg-white/15" style={{ width: `${[38, 30, 44, 34][i]}%` }} />
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs" style={{ color: b === 'LOW' ? 'var(--color-band-low)' : 'var(--color-band-critical)' }}>
            <BandIcon band={b} size={12} />{b}
          </span>
        </div>
      ))}
    </div>
  )
}

function Protocols() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs text-faint">Selling limit</p>
        <div className="h-7 w-[86%] rounded-md bg-white/15" />
      </div>
      <div>
        <p className="mb-1.5 text-xs text-faint">Manipulation limit</p>
        <div className="flex items-center gap-3">
          <div className="h-7 w-[54%] rounded-md" style={{ background: 'var(--story-gradient)' }} />
          <span className="text-xs font-medium text-[var(--color-story-1)]">Safe collateral size</span>
        </div>
      </div>
    </div>
  )
}

function Researchers() {
  return (
    <div className="flex gap-1.5">
      {STRIP.map((b, i) => (
        <div key={i} className="flex h-16 flex-1 items-end justify-center rounded border border-line bg-raised pb-2">
          <BandIcon band={b} size={11} />
        </div>
      ))}
    </div>
  )
}

const READERS = [
  { who: 'Pool creators.', line: 'Check any token Keel monitors before you accept it as collateral.', art: <PoolCreators /> },
  { who: 'Lending protocols.', line: 'Set your collateral caps beside what the market can absorb.', art: <Protocols /> },
  { who: 'Researchers.', line: 'Read every stored reading for an asset, and replay the ledgers Keel has reconstructed.', art: <Researchers /> },
]

export function Audience() {
  return (
    <section aria-labelledby="audience-title" className="rule px-[max(4vw,16px)] py-20 sm:py-28">
      <SectionHead id="audience-title" title="For anyone who lends against a price" />
      <div className="mt-12 divide-y divide-line border-y border-line">
        {READERS.map((r) => (
          <div key={r.who} className="grid items-center gap-6 py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
            <p className="text-[19px] leading-snug tracking-[-0.015em] text-soft">
              <span className="font-medium text-ink">{r.who}</span> {r.line}
            </p>
            <div aria-hidden="true" className="rounded-[16px] border border-line bg-sunk p-4">{r.art}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
