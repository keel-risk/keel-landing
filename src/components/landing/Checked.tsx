// Section 4. Illustrative: no ledger numbers, amounts, versions or token codes.
// No entrance animation; a line only moves its part of the drawing when pointed at.
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { SectionHead } from './primitives'

const LINKED = [
  'Every number carries the ledger it was read at and the methodology version that produced it, so anyone can reproduce it.',
  "Unknown means unknown. If Keel can't measure something, it says so instead of showing zero.",
  "Checks that couldn't run are listed, not hidden.",
]
const PLAIN = [
  "Keel's thresholds are chosen, not yet calibrated against past incidents, and the methodology says so.",
  "Keel measures liquidity on Stellar only. Deep markets on other exchanges don't count here.",
  'Read-only, always. Keel never holds keys or moves funds.',
]

function Part({ index, active, children, className }: { index: number; active: number | null; children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const on = active === index
  const dim = active !== null && !on
  return (
    <motion.div
      animate={reduce ? undefined : { scale: on ? 1.02 : 1, opacity: dim ? 0.35 : 1 }}
      style={reduce ? { opacity: dim ? 0.35 : 1 } : undefined}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
      className={cn('rounded-lg border p-4 transition-colors', on ? 'border-[var(--color-story-2)]' : 'border-line', className)}
    >
      {children}
    </motion.div>
  )
}

export function Checked() {
  const [active, setActive] = useState<number | null>(null)
  return (
    <section aria-labelledby="checked-title" className="rule px-[max(4vw,16px)] py-20 sm:py-28">
      <SectionHead id="checked-title" title="Built to be checked" />
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-14">
        <ul className="space-y-2">
          {LINKED.map((line, i) => (
            <li key={line}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn('w-full rounded-lg px-4 py-3 text-left text-[17px] transition-colors', active === i ? 'bg-white/[0.05] text-ink' : 'text-soft')}
              >
                {line}
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-3 rounded-[18px] border border-line bg-sunk p-4 sm:p-5" aria-hidden="true">
          <Part index={0} active={active}>
            <div className="h-5 w-40 rounded bg-white/20" />
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-soft">Ledger</span>
              <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-soft">Methodology</span>
            </div>
          </Part>
          <Part index={1} active={active}>
            <div className="flex items-center gap-3">
              <div className="hatch h-10 w-32 rounded border border-line" />
              <span className="font-mono text-sm text-soft">unknown</span>
            </div>
          </Part>
          <Part index={2} active={active} className="space-y-2.5">
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex items-center gap-3">
                <div className="h-3 rounded bg-white/15" style={{ width: `${[52, 38, 46][r]}%` }} />
                <span className={cn('ml-auto text-xs', r === 1 ? 'text-ink' : 'text-faint')}>{r === 1 ? 'not run' : 'ran'}</span>
              </div>
            ))}
          </Part>
        </div>
      </div>
      <ul className="mt-12 grid gap-4 border-t border-line pt-8 text-[15px] text-soft md:grid-cols-3">
        {PLAIN.map((l) => <li key={l}>{l}</li>)}
      </ul>
    </section>
  )
}
