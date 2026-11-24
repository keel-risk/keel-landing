// Small presentation pieces shared by every section. All are pure functions of props.
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Band } from '@/lib/fixtures'
import { splitDecimal } from '@/lib/format'
import { cn } from '@/lib/utils'

const bandColour: Record<Band, string> = {
  LOW: 'var(--color-band-low)',
  MEDIUM: 'var(--color-band-medium)',
  HIGH: 'var(--color-band-high)',
  CRITICAL: 'var(--color-band-critical)',
}

/** One icon shape per band, so the band never rests on colour alone. */
export function BandIcon({ band, size = 14 }: { band: Band; size?: number }) {
  const c = bandColour[band]
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
      {band === 'LOW' && <circle cx="7" cy="7" r="5.5" fill={c} />}
      {band === 'MEDIUM' && <rect x="2.6" y="2.6" width="8.8" height="8.8" rx="1" transform="rotate(45 7 7)" fill={c} />}
      {band === 'HIGH' && <path d="M7 1.2 13 12.4H1Z" fill={c} />}
      {band === 'CRITICAL' && (
        <>
          <path d="M4.3 1h5.4L13 4.3v5.4L9.7 13H4.3L1 9.7V4.3Z" fill={c} />
          <rect x="6.2" y="3.4" width="1.6" height="4.6" rx="0.8" fill="#0a0a0c" />
          <circle cx="7" cy="10" r="0.95" fill="#0a0a0c" />
        </>
      )}
    </svg>
  )
}

export function BandMark({ band, className }: { band: Band; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[13px] font-medium tracking-tight', className)} style={{ color: bandColour[band] }}>
      <BandIcon band={band} />
      {band}
    </span>
  )
}

/**
 * Shows a decimal string exactly as the API sent it. The integer part is set
 * large; the full fraction stays in the DOM, visually clipped after a few digits.
 */
export function DecimalValue({ value, unit, className, fracClassName }: { value: string; unit?: string; className?: string; fracClassName?: string }) {
  const { sign, int, frac } = splitDecimal(value)
  const full = unit ? `${value} ${unit}` : value
  return (
    <span className={cn('inline-flex max-w-full items-baseline font-mono tabular-nums', className)} title={full} aria-label={full}>
      <span aria-hidden="true" className="whitespace-nowrap">{sign}{int}</span>
      {frac && (
        <span aria-hidden="true" className={cn('inline-block max-w-[7ch] overflow-hidden text-ellipsis whitespace-nowrap align-baseline opacity-45', fracClassName)}>
          .{frac}
        </span>
      )}
      {unit && <span aria-hidden="true" className="ml-1.5 font-sans text-[0.72em] font-medium text-soft">{unit}</span>}
    </span>
  )
}

/** Ledger and methodology version: shown wherever a figure from Keel is shown. */
export function Provenance({ ledger, methodology, className, extra }: { ledger: number; methodology: string; className?: string; extra?: ReactNode }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-faint', className)}>
      <span>Ledger <span className="text-soft">{ledger}</span></span>
      <span>Methodology <span className="text-soft">{methodology}</span></span>
      {extra}
    </div>
  )
}

/** A glossary term that expands in place, Nutshell style. */
export function Term({ children, explain }: { children: ReactNode; explain: string }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help text-inherit underline decoration-dotted decoration-white/40 underline-offset-[5px] hover:decoration-white"
      >
        {children}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.span
            initial={reduce ? false : { opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="mx-1 inline rounded-md border border-line bg-raised px-2 py-0.5 text-[0.92em] text-soft"
          >
            {explain}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  )
}

export function SectionHead({ title, body, id }: { title: string; body?: ReactNode; id?: string }) {
  return (
    <div className="max-w-[640px]">
      <h2 id={id} className="title text-[clamp(30px,4.2vw,48px)]">{title}</h2>
      {body && <p className="mt-4 text-[17px] text-soft">{body}</p>}
    </div>
  )
}

export function Todo({ children }: { children: ReactNode }) {
  return <span className="rounded border border-dashed border-white/25 px-1.5 py-0.5 font-mono text-xs text-faint">TODO(copy): {children}</span>
}
