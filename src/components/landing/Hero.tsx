import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useKeelScene } from '@/hooks/useKeelScene'
import type { Reading } from '@/lib/fixtures'
import { shortAddress } from '@/lib/format'
import { BandMark, DecimalValue, Provenance } from './primitives'

gsap.registerPlugin(SplitText)

export const DASHBOARD_URL = 'https://keels.app'

function issuerLine(r: Reading) {
  const { asset } = r.body
  if (asset.type === 'native') return `${asset.code}, Stellar's native asset`
  return `${asset.code} issued by ${shortAddress(asset.issuer ?? '')}`
}

/** The hero's real reading. Pure: everything comes from the reading prop. */
export function ReadingCard({ reading }: { reading: Reading }) {
  const b = reading.body
  return (
    <Card className="w-full max-w-[420px] bg-ground/85 backdrop-blur-[2px]">
      <CardHeader className="pb-3">
        <p className="text-sm text-soft">{issuerLine(reading)}</p>
        <p className="text-[19px] leading-snug tracking-[-0.02em]">
          {b.maxSafeCollateral === null ? (
            <>Keel can't size a collateral position for {b.asset.code} yet.</>
          ) : (
            <>
              {b.asset.code} can back up to{' '}
              <DecimalValue value={b.maxSafeCollateral} unit={b.quote.code} className="text-[22px] text-ink" />{' '}
              as collateral.
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-faint">Band</dt>
          <dd><BandMark band={b.band} /></dd>
          <dt className="text-faint">Confidence</dt>
          <dd className="font-mono text-[13px] text-soft">{b.bandConfidence}</dd>
        </dl>
        {b.bandConfidence === 'partial' && (
          <p className="text-[13px] leading-snug text-soft">Some checks couldn't run, so the real risk may be higher.</p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <Provenance ledger={b.ledgerSeq} methodology={b.methodologyVersion} />
        <p className="font-mono text-xs text-faint">
          Recorded reading. Staleness at capture: <span className="text-soft">{reading.headers.stalenessSeconds} s</span>
        </p>
      </CardFooter>
    </Card>
  )
}

export function Hero({ reading }: { reading: Reading }) {
  const reduce = useReducedMotion() ?? false
  const sceneRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const restRef = useRef<HTMLDivElement>(null)
  useKeelScene(sceneRef, reduce)

  // The page's one orchestrated entrance: the headline sets letter by letter.
  useLayoutEffect(() => {
    if (reduce || !headRef.current) return
    const ctx = gsap.context(() => {
      const split = SplitText.create(headRef.current!, { type: 'words,chars', charsClass: 'split-char', aria: 'auto' })
      gsap.from(split.chars, { yPercent: 70, opacity: 0, filter: 'blur(6px)', duration: 0.9, ease: 'expo.out', stagger: 0.018 })
      gsap.from(restRef.current!.children, { y: 14, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay: 0.35 })
    })
    return () => ctx.revert()
  }, [reduce])

  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="px-[max(4vw,16px)] pb-8 pt-10 text-center sm:pt-14">
        <div className="mx-auto mb-6 inline-flex rounded-full border border-line bg-raised px-3 py-1.5">
          <Provenance ledger={reading.body.ledgerSeq} methodology={reading.body.methodologyVersion} />
        </div>
        <h1 id="hero-title" ref={headRef} className="display mx-auto max-w-[11ch] text-[clamp(44px,7.4vw,92px)]">
          What can this price carry?
        </h1>
        <div ref={restRef}>
          <p className="mx-auto mt-5 max-w-[620px] text-[17px] text-soft sm:text-[19px]">
            Keel measures how much real trading stands behind a token's price on Stellar, and how much of that token the market can back as loan collateral.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><a href={DASHBOARD_URL}>Check an asset</a></Button>
            <Button asChild size="lg" variant="outline"><a href="#story">See how it works</a></Button>
          </div>
        </div>
      </div>

      <div className="px-[max(2vw,10px)] pb-[max(2vw,10px)]">
        <div className="relative overflow-hidden rounded-[22px] border border-line bg-sunk [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:56px_56px] [background-position:center]">
          <div ref={sceneRef} className="h-[360px] w-full sm:h-[520px] lg:absolute lg:inset-0 lg:h-full" />
          <div className="relative flex min-h-0 p-3 sm:p-5 lg:min-h-[560px] lg:items-end lg:p-7">
            <ReadingCard reading={reading} />
          </div>
        </div>
      </div>
    </section>
  )
}
