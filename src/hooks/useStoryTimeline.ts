// One GSAP timeline, scrubbed by ScrollTrigger across the six story steps.
// Step i owns timeline time [i, i+1]. Under reduced motion the timeline never
// plays: each step jumps straight to its final state.
import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BASE_Y, LADDER, type StageGeometry } from '@/components/landing/StoryStage'

gsap.registerPlugin(ScrollTrigger)

const STEPS = 6

function rungFor(sub: number) {
  return sub < 0.5 ? 0 : sub < 0.75 ? 1 : 2
}
function ladderFor(sub: number) {
  return sub < 0.3 ? 0 : sub < 0.45 ? 1 : sub < 0.6 ? 2 : sub < 0.75 ? 3 : sub < 0.9 ? 4 : 0
}

export function useStoryTimeline(
  root: RefObject<HTMLElement | null>,
  steps: RefObject<HTMLElement | null>,
  geo: StageGeometry,
  reduce: boolean,
) {
  const [step, setStep] = useState(0)
  const [rung, setRung] = useState(0)
  const [ladder, setLadder] = useState(0)
  const last = useRef({ step: -1, rung: -1, ladder: -1 })

  useLayoutEffect(() => {
    if (!root.current || !steps.current) return
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      // On narrow screens the sticky stage covers the top half, so steps are read lower down.
      const anchor = window.innerWidth < 1024 ? '74%' : 'center'
      const center = { x: 320, y: 250 }
      const xlm = geo.xlmTops.map((p) => ({ x: p.x, y: p.y - 22 }))
      const safe = geo.limits.find((l) => l.isSafe)

      gsap.set(q('.st-dot'), { x: center.x, y: center.y })
      gsap.set(q('.st-bid'), { scaleX: 0, transformOrigin: '100% 50%' })
      gsap.set(q('.st-ask'), { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(q('.st-pool'), { strokeDasharray: 900, strokeDashoffset: 900 })
      gsap.set(q('.st-depth, .st-lend, .st-ladder, .st-limits'), { autoAlpha: 0 })
      gsap.set(q('.st-offers'), { autoAlpha: 0 })
      gsap.set(q('.st-xbar, .st-ubar'), { scaleY: 0, transformOrigin: '50% 100%' })
      gsap.set(q('.st-coll'), { scaleY: 0.25, transformOrigin: '50% 100%' })
      gsap.set(q('.st-loan'), { x: -200, autoAlpha: 0 })
      gsap.set(q('.st-limit'), { scaleX: 0, transformOrigin: '0% 50%' })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
      tl.addLabel('s0', 0)
      tl.to(q('.st-dot'), { scale: 1.25, duration: 0.4, ease: 'back.out(2)' }, 0.1)
      tl.to(q('.st-dot'), { scale: 1, duration: 0.3 }, 0.6)
      tl.addLabel('e0', 1)

      // Step 2: offers stack up behind the price
      tl.to(q('.st-offers'), { autoAlpha: 1, duration: 0.1 }, 1)
      tl.to(q('.st-bid'), { scaleX: 1, duration: 0.45, stagger: 0.04, ease: 'expo.out' }, 1.1)
      tl.to(q('.st-ask'), { scaleX: 1, duration: 0.45, stagger: 0.04, ease: 'expo.out' }, 1.1)
      tl.to(q('.st-pool'), { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, 1.15)
      tl.to(q('.st-dot'), { y: 278, duration: 0.5 }, 1.1)
      tl.addLabel('e1', 2)

      // Step 3: slope and cliff; the dot hops rung to rung on the first asset
      tl.to(q('.st-offers'), { autoAlpha: 0, duration: 0.15 }, 2)
      tl.to(q('.st-depth'), { autoAlpha: 1, duration: 0.15 }, 2.05)
      tl.to(q('.st-dot'), { x: 100, y: BASE_Y, duration: 0.15 }, 2.05)
      tl.to(q('.st-xbar'), { scaleY: 1, duration: 0.25, stagger: 0.05, ease: 'expo.out' }, 2.08)
      tl.to(q('.st-ubar'), { scaleY: 1, duration: 0.25, stagger: 0.05, ease: 'expo.out' }, 2.1)
      xlm.forEach((p, i) => {
        const t0 = 2.2 + i * 0.25
        tl.to(q('.st-dot'), { x: p.x, duration: 0.2, ease: 'power2.inOut' }, t0)
        tl.to(q('.st-dot'), { keyframes: [{ y: Math.min(p.y, i ? xlm[i - 1].y : BASE_Y) - 40, ease: 'power2.out' }, { y: p.y, ease: 'bounce.out' }], duration: 0.2 }, t0)
      })
      tl.addLabel('e2', 3)

      // Step 4: the lending app trusts the price
      tl.to(q('.st-depth'), { autoAlpha: 0, duration: 0.12 }, 3)
      tl.to(q('.st-lend'), { autoAlpha: 1, duration: 0.12 }, 3.05)
      tl.to(q('.st-dot'), { x: 190, y: BASE_Y - 65 - 30, duration: 0.12 }, 3.05)
      tl.to(q('.st-coll'), { scaleY: 1, duration: 0.22, ease: 'back.out(1.4)' }, 3.12)
      tl.to(q('.st-dot'), { y: BASE_Y - 260 - 30, duration: 0.22, ease: 'back.out(1.4)' }, 3.12)
      tl.to(q('.st-loan'), { x: 0, autoAlpha: 1, duration: 0.18, ease: 'expo.out' }, 3.34)
      tl.to(q('.st-coll'), { scaleY: 0.25, duration: 0.22, ease: 'power3.in' }, 3.62)
      tl.to(q('.st-dot'), { y: BASE_Y - 65 - 30, duration: 0.22, ease: 'bounce.out' }, 3.62)
      tl.addLabel('e3', 4)

      // Step 5: up the ladder to 100x, then back down
      tl.to(q('.st-lend'), { autoAlpha: 0, duration: 0.12 }, 4)
      tl.to(q('.st-ladder'), { autoAlpha: 1, duration: 0.12 }, 4.05)
      tl.to(q('.st-dot'), { x: 320, y: LADDER[0].y, duration: 0.12 }, 4.05)
      LADDER.slice(1).forEach((r, i) => {
        tl.to(q('.st-dot'), { y: r.y, duration: 0.13, ease: 'back.out(2.2)' }, 4.17 + i * 0.15)
      })
      tl.addLabel('p4', 4.8)
      tl.to(q('.st-dot'), { y: LADDER[0].y, duration: 0.14, ease: 'power4.in' }, 4.84)
      tl.addLabel('e4', 5)

      // Step 6: the two limits, the dot settles at the end of the lower one
      tl.to(q('.st-ladder'), { autoAlpha: 0, duration: 0.12 }, 5)
      tl.to(q('.st-limits'), { autoAlpha: 1, duration: 0.12 }, 5.05)
      tl.to(q('.st-limit'), { scaleX: 1, duration: 0.25, stagger: 0.06, ease: 'expo.out' }, 5.08)
      if (safe) tl.to(q('.st-dot'), { x: 90 + safe.width, y: safe.y + 17, duration: 0.22, ease: 'back.out(1.6)' }, 5.2)
      tl.addLabel('e5', 6)
      // Pad to exactly six units so scroll progress maps one step per unit.
      tl.set({}, {}, 6)

      const publish = (time: number) => {
        const s = Math.min(STEPS - 1, Math.max(0, Math.floor(time)))
        const sub = time - s
        const r = s === 2 ? rungFor(sub) : s > 2 ? 2 : 0
        const l = s === 4 ? ladderFor(sub) : 0
        if (s !== last.current.step) setStep((last.current.step = s))
        if (r !== last.current.rung) setRung((last.current.rung = r))
        if (l !== last.current.ladder) setLadder((last.current.ladder = l))
      }

      if (reduce) {
        // No movement: each step shows its final state.
        ScrollTrigger.create({
          trigger: steps.current,
          start: `top ${anchor}`,
          end: `bottom ${anchor}`,
          onUpdate: (self) => {
            const s = Math.min(STEPS - 1, Math.floor(self.progress * STEPS))
            if (s === last.current.step) return
            tl.seek(s === 4 ? 'p4' : `e${s}`, false)
            publish(s === 4 ? 4.8 : s + 0.999)
          },
        })
        tl.seek('e0', false)
        publish(0.999)
      } else {
        tl.eventCallback('onUpdate', () => publish(tl.time()))

        ScrollTrigger.create({ trigger: steps.current, start: `top ${anchor}`, end: `bottom ${anchor}`, scrub: 0.7, animation: tl })
        publish(0)
      }
    }, root)
    // Positions are measured once; measure again when web fonts and images settle.
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [root, steps, geo, reduce])

  return { step, rung, ladder }
}
