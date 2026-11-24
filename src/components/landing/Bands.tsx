import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { Band, Reading } from '@/lib/fixtures'
import { deltaLabel, formatUtc } from '@/lib/format'
import { BandIcon, BandMark, DecimalValue, Provenance, SectionHead, Todo } from './primitives'

const BAND_ORDER: Band[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const bandVar: Record<Band, string> = {
  LOW: 'var(--color-band-low)',
  MEDIUM: 'var(--color-band-medium)',
  HIGH: 'var(--color-band-high)',
  CRITICAL: 'var(--color-band-critical)',
}

interface Run { band: Band; from: number; fromAt: string; to: number; toAt: string; n: number }

/** Band over time for one asset. Widths are reading counts, not risk figures. */
function BandHistory({ code, runs, points, methodology }: { code: string; runs: Run[]; points: number; methodology: string }) {
  const first = runs[0]
  const last = runs[runs.length - 1]
  return (
    <figure className="rounded-lg border border-line bg-raised p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{code}, band over time</span>
        <span className="font-mono text-xs text-faint">{points} readings</span>
      </figcaption>
      <div className="mt-5 flex h-14 w-full overflow-hidden rounded-md" role="img" aria-label={`${code} band history: ${runs.map((r) => `${r.band} for ${r.n} readings`).join(', ')}`}>
        {runs.map((r) => (
          <div key={r.from} className="relative h-full min-w-[3px]" style={{ flexGrow: r.n, flexBasis: 0, background: bandVar[r.band], opacity: r.band === 'LOW' ? 0.55 : 1 }} title={`${r.band}, ledger ${r.from} to ${r.to}`} />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-faint">
        <span>{formatUtc(first.fromAt)}</span>
        <span>{formatUtc(last.toAt)}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {BAND_ORDER.filter((b) => runs.some((r) => r.band === b)).map((b) => <BandMark key={b} band={b} />)}
      </div>
      <Provenance className="mt-4" ledger={last.to} methodology={methodology} extra={<span>Ledgers {first.from} to {last.to}</span>} />
    </figure>
  )
}

function Evidence({ reading }: { reading: Reading }) {
  const b = reading.body
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-faint">
            <th className="py-2 pr-4 font-normal">Depth</th>
            <th className="py-2 pr-4 text-right font-normal">Buy side</th>
            <th className="py-2 pr-4 text-right font-normal">Sell side</th>
            <th className="py-2 pr-4 text-right font-normal">From order book</th>
            <th className="py-2 text-right font-normal">From pools</th>
          </tr>
        </thead>
        <tbody>
          {b.depth.map((d) => (
            <tr key={d.delta} className="border-t border-line">
              <td className="py-2.5 pr-4 font-mono">{deltaLabel(d.delta)}</td>
              <td className="py-2.5 pr-4 text-right"><DecimalValue value={d.buySide} /></td>
              <td className="py-2.5 pr-4 text-right"><DecimalValue value={d.sellSide} /></td>
              <td className="py-2.5 pr-4 text-right"><DecimalValue value={d.fromSdex} /></td>
              <td className="py-2.5 text-right"><DecimalValue value={d.fromAmm} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-faint">Amounts in {b.quote.code}, as the API sends them.</p>
    </div>
  )
}

export function Bands({ reading, history }: { reading: Reading; history: { runs: Run[]; points: number; methodologyVersion: string } }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const b = reading.body
  return (
    <section id="bands" aria-labelledby="bands-title" className="rule px-[max(4vw,16px)] py-20 sm:py-28">
      <SectionHead id="bands-title" title="One word first. The evidence when you want it." body="Every asset gets a band and one plain sentence. Open it to see the numbers behind the sentence." />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            {BAND_ORDER.map((band) => (
              <li key={band} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4">
                <span className="w-28"><BandMark band={band} /></span>
                <Todo>Al writes one sentence for {band}</Todo>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-3 text-[15px] text-soft">
            <li>Partial confidence means some checks couldn't run. The real band can only be the same or worse.</li>
            <li className="flex gap-2">
              <span className="mt-1"><BandIcon band="CRITICAL" /></span>
              No price at all is a finding, not an error. Keel marks it CRITICAL.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <BandHistory code={b.asset.code} runs={history.runs} points={history.points} methodology={history.methodologyVersion} />

          <div className="rounded-lg border border-line bg-raised p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{b.asset.code}</span>
                <BandMark band={b.band} />
                <span className="font-mono text-xs text-faint">confidence {b.bandConfidence}</span>
              </div>
              <Button variant="outline" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                {open ? 'Hide the evidence' : 'Show the evidence'}
              </Button>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="evidence"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.12, duration: 0.5 }}
                  className="overflow-hidden"
                >
                  <div className="pt-5"><Evidence reading={reading} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            <Provenance className="mt-4" ledger={b.ledgerSeq} methodology={b.methodologyVersion} />
          </div>
        </div>
      </div>
    </section>
  )
}
