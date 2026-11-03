// Satisfies every mechanical rule. If the auditor starts reporting findings here,
// it has grown a false positive and will get ignored in real projects.
import { motion } from 'framer-motion'

export function Hero() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {}
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section aria-labelledby="hero-title">
      <img src="/hero.png" alt="" />
      <h1 id="hero-title" className="leading-tight overflow-hidden">
        Hello
      </h1>
      <button type="button">Go</button>
    </section>
  )
}