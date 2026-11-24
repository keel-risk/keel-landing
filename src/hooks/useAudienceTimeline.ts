// Scroll-scrubbed timeline for the "Who it's for" deck. Reader i owns
// timeline time [i, i+1]: its card comes to the front, its drawing builds,
// and the progress line on the reader list fills toward the next reader.
// Under reduced motion each reader jumps straight to its final state.
import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useAudienceTimeline(root: RefObject<HTMLElement | null>, steps: RefObject<HTMLElement | null>, count: number, reduce: boolean) {
  const [active, setActive] = useState(0)
  const last = useRef(-1)

  useLayoutEffect(() => {
    if (!root.current || !steps.current) return
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root.current)
      const anchor = window.innerWidth < 1024 ? '74%' : 'center'
      const cards = q('.au-card')
      const fills = q('.au-fill')

      // Deck: the first card in front, the others waiting below.
      gsap.set(cards, { yPercent: 70, scale: 0.94, autoAlpha: 0, transformOrigin: '50% 0%' })
      gsap.set(cards[0], { yPercent: 0, scale: 1, autoAlpha: 1 })
      gsap.set(fills, { scaleY: 0, transformOrigin: '50% 0%' })
      gsap.set(q('.au-row'), { x: 60, autoAlpha: 0 })
      gsap.set(q('.au-chip'), { scale: 0.4, autoAlpha: 0 })
      gsap.set(q('.au-sell'), { scaleX: 0, transformOrigin: '0% 50%' })
      gsap.set(q('.au-manip'), { width: '0%' })
      gsap.set(q('.au-safe'), { autoAlpha: 0, y: 8 })
      gsap.set(q('.au-cell'), { yPercent: 60, autoAlpha: 0 })
      gsap.set(q('.au-head'), { left: '0%', autoAlpha: 0 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

      // Reader 1: asset rows slide in, then each band settles on its row.
      tl.to(q('.au-row'), { x: 0, autoAlpha: 1, duration: 0.3, stagger: 0.07 }, 0.05)
      tl.to(q('.au-chip'), { scale: 1, autoAlpha: 1, duration: 0.2, stagger: 0.07, ease: 'back.out(2.4)' }, 0.25)
      tl.addLabel('e0', 0.7)

      // Hand over to reader 2: the first card steps back into the deck.
      tl.to(fills[0], { scaleY: 1, duration: 0.6, ease: 'none' }, 0.4)
      tl.to(cards[0], { yPercent: -7, scale: 0.92, autoAlpha: 0.45, duration: 0.25, ease: 'power2.inOut' }, 0.8)
      tl.to(cards[1], { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.25, ease: 'power2.inOut' }, 0.8)

      // Reader 2: the two limits grow, the lower one is marked.
      tl.to(q('.au-sell'), { scaleX: 1, duration: 0.25, ease: 'expo.out' }, 1.1)
      tl.to(q('.au-manip'), { width: '58%', duration: 0.25, ease: 'expo.out' }, 1.25)
      tl.to(q('.au-safe'), { autoAlpha: 1, y: 0, duration: 0.15 }, 1.45)
      tl.addLabel('e1', 1.7)

      // Hand over to reader 3.
      tl.to(fills[1], { scaleY: 1, duration: 0.6, ease: 'none' }, 1.4)
      tl.to(cards[0], { yPercent: -13, scale: 0.86, autoAlpha: 0.15, duration: 0.25, ease: 'power2.inOut' }, 1.8)
      tl.to(cards[1], { yPercent: -7, scale: 0.92, autoAlpha: 0.45, duration: 0.25, ease: 'power2.inOut' }, 1.8)
      tl.to(cards[2], { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.25, ease: 'power2.inOut' }, 1.8)

      // Reader 3: readings line up, then the replay head walks along them.
      tl.to(q('.au-cell'), { yPercent: 0, autoAlpha: 1, duration: 0.25, stagger: 0.02, ease: 'back.out(1.8)' }, 2.08)
      tl.to(q('.au-head'), { autoAlpha: 1, duration: 0.05 }, 2.4)
      tl.to(q('.au-head'), { left: '62%', duration: 0.45, ease: 'power1.inOut' }, 2.4)
      tl.addLabel('e2', 3)
      tl.set({}, {}, count)

      const publish = (time: number) => {
        const s = Math.min(count - 1, Math.max(0, Math.floor(time)))
        if (s !== last.current) setActive((last.current = s))
      }

      if (reduce) {
        ScrollTrigger.create({
          trigger: steps.current,
          start: `top ${anchor}`,
          end: `bottom ${anchor}`,
          onUpdate: (self) => {
            const s = Math.min(count - 1, Math.floor(self.progress * count))
            if (s === last.current) return
            tl.seek(`e${s}`, false)
            publish(s)
          },
        })
        tl.seek('e0', false)
        publish(0)
      } else {
        tl.eventCallback('onUpdate', () => publish(tl.time()))
        ScrollTrigger.create({ trigger: steps.current, start: `top ${anchor}`, end: `bottom ${anchor}`, scrub: 0.7, animation: tl })
        publish(0)
      }
    }, root)
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
  }, [root, steps, count, reduce])

  return active
}
