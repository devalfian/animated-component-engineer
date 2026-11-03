// @ts-nocheck — this fixture imports packages that are not installed in this
// repository. It exists for the auditor's smoke test, not for type checking.
// Deliberately violates the audit rules. If the auditor stops reporting these,
// the gate has rotted — see ../../test-scenarios/07-jank-investigation.md.
import { motion } from 'framer-motion'
import gsap from 'gsap'

export function Hero() {
  const a = requestAnimationFrame(() => {})
  const b = requestAnimationFrame(() => {})

  useEffect(() => {
    window.addEventListener('scroll', onScroll)
  }, [])

  return (
    <div onClick={() => gsap.to('.x', { y: 10 })}>
      <img src="/hero.png" />
      <h1 className="leading-none overflow-hidden duration-fast">{a}{b}</h1>
      <p style={{ transition: 'width 300ms ease' }}>{console.log('debug')}</p>
    </div>
  )
}