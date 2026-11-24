// Section 5, "Who it's for". Reader list on the left, one illustrated card per
// reader on the right. Illustrative: shapes, labels and band tokens only, no
// numbers, no token codes, bands limited to LOW and CRITICAL. Drawn in code,
// no stock or generated images. Scroll-driven like the story: each reader
// brings its card to the front of a sticky deck and its drawing builds.
import { useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { useAudienceTimeline } from '@/hooks/useAudienceTimeline'
import { History, Layers, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Band } from '@/lib/fixtures'
import { cn } from '@/lib/utils'
import { DASHBOARD_URL } from './Hero'
import { BandIcon } from './primitives'

type Reader = {
  id: string
  who: string
  line: string
  tag: string
  title: string
  icon: ReactNode
  accent: string
  mesh: string
  art: ReactNode
}

const glass = 'border border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_18px_40px_-18px_rgb(0_0_0/0.7)] backdrop-blur-md'

function BandChip({ band }: { band: Band }) {
  const colour = band === 'LOW' ? 'var(--color-band-low)' : 'var(--color-band-critical)'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[11px]" style={{ color: colour }}>
      <BandIcon band={band} size={11} />
      {band}
    </span>
  )
}

/** Pool creators: a short list of asset rows, names as skeleton bars, each with a band. */
function AssetRowsArt() {
  const rows: { band: Band; w: number; lift: boolean }[] = [
    { band: 'LOW', w: 58, lift: false },
    { band: 'CRITICAL', w: 44, lift: true },
    { band: 'LOW', w: 66, lift: false },
    { band: 'LOW', w: 50, lift: false },
  ]
  return (
    <div className="flex h-full items-center justify-center [perspective:900px]">
      <div className="w-[74%] max-w-[300px] space-y-2 [transform:rotateX(20deg)_rotateZ(-6deg)] [transform-style:preserve-3d]">
        {rows.map((r, i) => (
          <div key={i} style={{ transform: r.lift ? 'translateZ(28px) translateX(18px)' : undefined }}>
            <div className={cn('au-row flex items-center gap-3 rounded-xl px-3 py-2.5', glass, r.lift && 'border-white/35 bg-white/[0.14]')}>
              <span className="size-5 shrink-0 rounded-full bg-white/25" />
              <span className="h-2.5 rounded-full bg-white/35" style={{ width: `${r.w}%` }} />
              <span className="au-chip ml-auto"><BandChip band={r.band} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Lending protocols: the selling limit and the manipulation limit, the lower one marked. */
function LimitsArt() {
  return (
    <div className="flex h-full items-center justify-center [perspective:900px]">
      <div className="w-[80%] space-y-5 [transform:rotateX(18deg)_rotateY(-14deg)] [transform-style:preserve-3d]">
        <div>
          <p className="mb-1.5 text-[12px] text-white/70">Selling limit</p>
          <div className={cn('au-sell h-9 w-[92%] rounded-xl', glass)} />
        </div>
        <div style={{ transform: 'translateZ(40px)' }}>
          <p className="mb-1.5 text-[12px] text-white/70">Manipulation limit</p>
          <div className="au-manip relative h-9 w-[58%] rounded-xl border border-white/30 shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_20px_40px_-16px_rgb(0_0_0/0.8)]" style={{ background: 'linear-gradient(100deg, #ffffff, var(--color-story-1) 35%, var(--color-story-2))' }}>
            <span className="absolute -right-2 top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--color-story-2)]" />
          </div>
          <p className="au-safe mt-2 text-[12px] font-medium text-white">Safe collateral size</p>
        </div>
      </div>
    </div>
  )
}

/** Researchers: one asset's band over time as a strip of readings, with a replay head. */
function BandStripArt() {
  const strip: Band[] = ['LOW', 'LOW', 'LOW', 'CRITICAL', 'CRITICAL', 'LOW', 'LOW', 'LOW', 'CRITICAL', 'LOW', 'LOW', 'LOW']
  return (
    <div className="flex h-full items-center justify-center overflow-hidden [perspective:1100px]">
      <div className="relative flex w-[92%] gap-2 [transform:rotateX(20deg)_rotateY(-10deg)] [transform-style:preserve-3d]">
        {strip.map((b, i) => (
          <div key={i} className={cn('au-cell flex h-24 flex-1 items-end justify-center rounded-lg pb-3', glass)}>
            <BandIcon band={b} size={12} />
          </div>
        ))}
        <span className="au-head absolute -bottom-3 -top-3 w-0.5 rounded-full bg-white shadow-[0_0_0_4px_rgb(255_255_255/0.12)]" style={{ transform: 'translateZ(30px)' }} />
      </div>
    </div>
  )
}

const READERS: Reader[] = [
  {
    id: 'pool',
    who: 'Pool creators',
    line: 'Check any token Keel monitors before you accept it as collateral.',
    tag: 'Pool creators',
    title: 'A band for every asset',
    icon: <Layers />,
    accent: 'var(--color-story-1)',
    mesh: 'radial-gradient(120% 90% at 85% 0%, #7fe9ff 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, #2c4bd8 0%, transparent 60%), linear-gradient(160deg, #1d6f9e, #142a6b)',
    art: <AssetRowsArt />,
  },
  {
    id: 'lending',
    who: 'Lending protocols',
    line: 'Set your collateral caps beside what the market can absorb.',
    tag: 'Lending protocols',
    title: 'Two limits, one cap',
    icon: <Scale />,
    accent: 'var(--color-story-3)',
    mesh: 'radial-gradient(110% 90% at 100% 100%, #f27ad9 0%, transparent 55%), radial-gradient(90% 90% at 0% 0%, #6d5cff 0%, transparent 60%), linear-gradient(200deg, #3b2a9e, #241a5c)',
    art: <LimitsArt />,
  },
  {
    id: 'research',
    who: 'Researchers',
    line: 'Read every stored reading for an asset, and replay the ledgers Keel has reconstructed.',
    tag: 'Researchers',
    title: 'Every reading, replayable',
    icon: <History />,
    accent: 'var(--color-story-4)',
    mesh: 'radial-gradient(70% 120% at 100% 50%, #ff7ad0 0%, transparent 55%), radial-gradient(80% 120% at 0% 0%, #5b8cff 0%, transparent 60%), linear-gradient(120deg, #23307e, #5a2a8a)',
    art: <BandStripArt />,
  },
]

const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`

function ReaderCard({ r, index }: { r: Reader; index: number }) {
  return (
    <article
      aria-labelledby={`card-${r.id}`}
      className="au-card absolute inset-0 isolate overflow-hidden rounded-[24px] border border-white/15 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]"
      style={{ background: r.mesh, zIndex: index + 1 }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay" style={{ backgroundImage: grain }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-[76px] top-[76px]">{r.art}</div>
      <span className="absolute left-5 top-5 grid size-11 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md [&_svg]:size-[18px]">
        {r.icon}
      </span>
      <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
        {r.tag}
      </span>
      <h3 id={`card-${r.id}`} className="absolute bottom-5 left-6 right-6 text-[clamp(22px,2.4vw,32px)] font-semibold leading-tight tracking-[-0.035em] text-white">
        {r.title}
      </h3>
    </article>
  )
}

export function Audience() {
  const reduce = useReducedMotion() ?? false
  const rootRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLOListElement>(null)
  const active = useAudienceTimeline(rootRef, stepsRef, READERS.length, reduce)

  return (
    <section ref={rootRef} aria-labelledby="audience-title" className="rule">
      <div className="px-[max(4vw,16px)] pt-20 sm:pt-28">
        <h2 id="audience-title" className="display max-w-[12ch] text-[clamp(40px,5.6vw,72px)]">For anyone who lends against a price</h2>
      </div>

      <div className="flex flex-col px-[max(4vw,16px)] pb-20 sm:pb-28 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {/* Sticky deck */}
        <div className="sticky top-16 z-10 order-first -mx-[max(4vw,16px)] bg-ground/95 px-[max(4vw,16px)] pb-4 pt-6 backdrop-blur lg:order-none lg:col-start-2 lg:row-start-1 lg:top-[14vh] lg:mx-0 lg:h-fit lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="relative mx-auto h-[min(46vh,360px)] w-full max-w-[640px] pt-[6%] lg:h-[min(66vh,560px)]">
            <div className="relative h-full">
              {READERS.map((r, i) => <ReaderCard key={r.id} r={r} index={i} />)}
            </div>
          </div>
        </div>

        {/* Readers, read as you scroll */}
        <div className="lg:col-start-1 lg:row-start-1">
          <ol ref={stepsRef}>
            {READERS.map((r, i) => {
              const on = active === i
              return (
                <li
                  key={r.id}
                  aria-current={on ? 'step' : undefined}
                  className={cn('relative grid min-h-[56vh] grid-cols-[32px_minmax(0,1fr)] content-center gap-x-4 transition-opacity duration-500 lg:min-h-[70vh]', on ? 'opacity-100' : 'opacity-40')}
                >
                  {i < READERS.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[15px] top-[calc(50%+20px)] h-[calc(100%-40px)] w-px bg-white/10">
                      <span className="au-fill absolute inset-0" style={{ background: `linear-gradient(${r.accent}, ${READERS[i + 1].accent})` }} />
                    </span>
                  )}
                  <span aria-hidden="true" className="mt-0.5 grid size-8 place-items-center rounded-full border-2 bg-ground" style={{ borderColor: r.accent }}>
                    <span className={cn('size-3 rounded-full transition-transform duration-300', on ? 'scale-125' : 'scale-75')} style={{ background: r.accent }} />
                  </span>
                  <div>
                    <h3 className="text-[clamp(22px,2.2vw,28px)] font-medium tracking-[-0.025em]" style={{ color: r.accent }}>{r.who}</h3>
                    <p className="mt-2 max-w-[40ch] text-[17px] text-soft">{r.line}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          <Button asChild size="lg" className="ml-12 w-fit"><a href={DASHBOARD_URL}>Check an asset</a></Button>
        </div>
      </div>
    </section>
  )
}
