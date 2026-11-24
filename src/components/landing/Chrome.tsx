import { Button } from '@/components/ui/button'
import type { Reading } from '@/lib/fixtures'
import { BACKTEST_URL } from './Story'
import { DASHBOARD_URL } from './Hero'
import { Provenance } from './primitives'

const METHODOLOGY_URL = 'https://github.com/Keel-Official/keel-backend/tree/main/docs/methodology'

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ground/80 backdrop-blur-md">
      <div className="frame flex h-16 items-center gap-6 px-[max(4vw,16px)]">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="text-[19px] font-semibold tracking-[-0.04em]">Keel</span>
          <span className="hidden text-sm text-faint sm:inline">on Stellar</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {[
            ['How it works', '#story'],
            ['Bands', '#bands'],
            ['Ways in', '#ways-in'],
          ].map(([label, href]) => (
            <Button key={href} asChild variant="ghost" size="sm"><a href={href}>{label}</a></Button>
          ))}
        </nav>
        <Button asChild size="sm" className="ml-auto"><a href={DASHBOARD_URL}>Check an asset</a></Button>
      </div>
    </header>
  )
}

export function Closing({ reading }: { reading: Reading }) {
  return (
    <>
      <section aria-labelledby="closing-title" className="rule px-[max(4vw,16px)] py-24 text-center sm:py-32">
        <h2 id="closing-title" className="display mx-auto max-w-[14ch] text-[clamp(38px,6vw,76px)]">Check the market behind the price.</h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><a href={DASHBOARD_URL}>Check an asset</a></Button>
          <Button asChild size="lg" variant="outline"><a href={METHODOLOGY_URL}>Read the methodology</a></Button>
        </div>
      </section>
      <footer className="rule px-[max(4vw,16px)] py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 text-sm text-soft">
            <p>Keel reports liquidity. The lender decides.</p>
            <p>Not an oracle. Not investment advice.</p>
            <a href={BACKTEST_URL} className="inline-block pt-2 text-faint underline decoration-white/20 underline-offset-4 hover:text-ink">Read the backtest report</a>
          </div>
          <div className="space-y-1">
            <Provenance ledger={reading.body.ledgerSeq} methodology={reading.body.methodologyVersion} />
            <p className="font-mono text-xs text-faint">Recorded reading. Staleness at capture: {reading.headers.stalenessSeconds} s</p>
          </div>
        </div>
      </footer>
    </>
  )
}
