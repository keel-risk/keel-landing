import { useMemo, useRef, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { useStoryTimeline } from '@/hooks/useStoryTimeline'
import type { Reading } from '@/lib/fixtures'
import { cn } from '@/lib/utils'
import { DASHBOARD_URL } from './Hero'
import { DecimalValue, SectionHead, Term, Todo } from './primitives'
import { StoryStage, stageGeometry } from './StoryStage'

export const BACKTEST_URL = 'https://raw.githubusercontent.com/Keel-Official/keel-backend/main/docs/report/blend-february-2026.md'

function at5(r: Reading) {
  return r.body.depth.find((d) => d.delta === 0.05)?.sellSide ?? null
}

export function Story({ deep, thin, limitsFrom }: { deep: Reading; thin: Reading; limitsFrom: Reading }) {
  const reduce = useReducedMotion() ?? false
  const rootRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLOListElement>(null)
  const geo = useMemo(() => stageGeometry(deep, thin, limitsFrom), [deep, thin, limitsFrom])
  const { step, rung, ladder } = useStoryTimeline(rootRef, stepsRef, geo, reduce)

  const deep5 = at5(deep)
  const thin5 = at5(thin)

  const steps: { title: string; body: ReactNode }[] = [
    {
      title: 'A price is only the last trade.',
      body: 'It tells you what someone just paid. It does not tell you what the next seller will get.',
    },
    {
      title: 'What matters is what stands behind it.',
      body: (
        <>
          Behind every price on Stellar are open offers to buy and sell, in the{' '}
          <Term explain="Stellar's built-in exchange (SDEX), where people leave offers to buy or sell at a set price.">order book</Term> and in{' '}
          <Term explain="A pool holding two tokens that trades automatically, at a price set by how much of each it holds.">liquidity pools</Term>. The more of them there are, the harder the price is to move.
        </>
      ),
    },
    {
      title: 'Some markets are a slope. Some are a cliff.',
      body: (
        <>
          {deep.body.asset.code} can absorb {deep5 ? <DecimalValue value={deep5} unit={deep.body.quote.code} /> : 'an unknown amount'} of selling before its price drops 5%.{' '}
          {thin.body.asset.code} can absorb {thin5 ? <DecimalValue value={thin5} unit={thin.body.quote.code} /> : 'an unknown amount'}.
        </>
      ),
    },
    {
      title: 'Lending apps trust the price.',
      body: 'A lending app values your collateral at the price it sees. If that price is cheap to push up, someone can borrow far more than their collateral is really worth.',
    },
    {
      title: 'It happened on Stellar.',
      body: (
        <>
          On 22 February 2026, USTRY, a thinly traded token, was pushed to roughly 100 times its price and used as collateral on Blend.{' '}
          <Todo>incident figure, pending exploit ledger</Todo>
          <a href={BACKTEST_URL} className="mt-4 block w-fit text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white">Read the backtest report</a>
        </>
      ),
    },
    {
      title: 'Keel measures the market behind the price.',
      body: (
        <>
          Every 15 minutes, Keel reads Stellar's order books and liquidity pools and works out two limits. The selling limit: how much collateral the market can absorb in a forced sale. The manipulation limit: the point where pushing the price up costs less than the loan it would unlock. The lower of the two is the safe collateral size.
          <a href={DASHBOARD_URL} className="mt-4 block w-fit text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white">Explore it yourself</a>
        </>
      ),
    },
  ]

  return (
    <section id="story" ref={rootRef} aria-labelledby="story-title" className="rule">
      <div className="px-[max(4vw,16px)] pt-20 sm:pt-28">
        <SectionHead id="story-title" title="Price is not liquidity" />
      </div>
      <div className="flex flex-col px-[max(4vw,16px)] lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="sticky top-16 z-10 order-first -mx-[max(4vw,16px)] border-b border-line bg-ground/95 px-[max(4vw,16px)] pb-3 pt-4 backdrop-blur lg:order-none lg:col-start-2 lg:row-start-1 lg:top-[12vh] lg:mx-0 lg:h-fit lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="mx-auto max-h-[46vh] overflow-hidden lg:max-h-none">
            <StoryStage step={step} rung={rung} ladder={ladder} deep={deep} thin={thin} limitsFrom={limitsFrom} geo={geo} />
          </div>
        </div>
        <ol ref={stepsRef} className="lg:col-start-1 lg:row-start-1">
          {steps.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? 'step' : undefined}
              className={cn('flex min-h-[60vh] flex-col justify-center py-8 transition-opacity duration-500 lg:min-h-[88vh] lg:py-10', i === step ? 'opacity-100' : 'opacity-40')}
            >
              <p className="mb-3 font-mono text-xs text-faint">Step {i + 1} of {steps.length}</p>
              <h3 className="title text-[clamp(24px,2.6vw,34px)]">{s.title}</h3>
              <div className="mt-4 max-w-[46ch] text-[17px] text-soft">{s.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
