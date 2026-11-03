#!/usr/bin/env node
// Mechanical motion audit for a host project.
//
// Only objectively decidable rules live here. Judgement calls — is this the
// right engine, does this read well, is this the right primitive — belong to
// docs/visual-qa.md, which a model runs. This script is the floor, not the
// ceiling.
//
// Usage:
//   node audit-motion.mjs [path ...] [--json] [--quiet]
//   node audit-motion.mjs src                      # scoped
//   node audit-motion.mjs . --json > report.json
//
// Exit: 0 = no FAILs, 1 = one or more FAILs, 2 = bad usage.
// FAIL must be fixed. WARN is a judgement call: fix it or justify it. SKIP means
// a check could not apply — an honest skip beats a meaningless pass.

import { readFileSync, statSync, readdirSync } from 'node:fs'
import { join, extname, relative, resolve, basename, sep } from 'node:path'

// ── configuration ────────────────────────────────────────────────────────────

const SOURCE_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.vue', '.svelte', '.astro',
  '.css', '.scss', '.pcss', '.html',
])

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.output',
  '.turbo', '.vercel', '.cache', 'dist', 'build', 'out', 'coverage', 'vendor',
  '.venv', 'venv', '__pycache__',
  // A directory named `fixtures` is test data by convention — including the
  // ones committed in this repository that deliberately violate the rules.
  // Passing such a directory as an explicit root still scans it.
  'fixtures', '__fixtures__',
])

// DOM-animation families that overlap. Two of these in one project means two
// motion languages. WebGL renderers, Lottie playback and smooth-scroll
// libraries are deliberately excluded — they do a different job and pair
// legitimately with any of the above.
const FAMILIES = [
  { name: 'motion (Framer Motion / Motion One / motion-v)', re: /^(framer-motion|motion|motion\/react|motion-v|@motionone\/[a-z-]+)$/ },
  { name: 'GSAP', re: /^gsap(\/.*)?$/ },
  { name: 'anime.js', re: /^(animejs|anime\.js)$/ },
  { name: 'react-spring', re: /^@react-spring\/[a-z-]+$/ },
  { name: '@vueuse/motion', re: /^@vueuse\/motion$/ },
  { name: 'popmotion', re: /^popmotion$/ },
  { name: 'velocity', re: /^velocity-animate$/ },
  { name: 'AOS / WOW', re: /^(aos|wowjs)$/ },
  { name: 'react-transition-group', re: /^react-transition-group$/ },
]

// A file that owns a render loop is allowed to call requestAnimationFrame for
// startup and restart. Anything else doing it more than once is building a
// second loop.
const TICKER_FILE = /(ticker|raf|render-loop|animation-frame|frame-loop)/i

const LAYOUT_PROPS = 'width|height|top|left|right|bottom|margin|padding'
const LAYOUT_RE = new RegExp(`\\b(?:${LAYOUT_PROPS})\\b`)

// ── findings ─────────────────────────────────────────────────────────────────

const findings = []
let skips = 0

const add = (level, rule, why, hits) => {
  if (!hits || hits.length === 0) return
  findings.push({ level, rule, why, hits })
}
const skip = (rule, why) => {
  skips += 1
  findings.push({ level: 'SKIP', rule, why, hits: [] })
}

// ── arguments ────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const json = argv.includes('--json')
const quiet = argv.includes('--quiet')

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 19).join('\n').replace(/^\/\/ ?/gm, ''))
  process.exit(0)
}

const roots = argv.filter((a) => !a.startsWith('-'))
if (roots.length === 0) roots.push('.')

for (const root of roots) {
  try {
    if (!statSync(root).isDirectory()) throw new Error('not a directory')
  } catch {
    console.error(`audit-motion: no such directory: ${root}`)
    process.exit(2)
  }
}

// ── file collection ──────────────────────────────────────────────────────────

const files = []

const walk = (dir) => {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full)
    } else if (entry.isFile() && SOURCE_EXT.has(extname(entry.name))) {
      files.push(full)
    }
  }
}

for (const root of roots) walk(resolve(root))
files.sort()

// ── helpers ──────────────────────────────────────────────────────────────────

const cache = new Map()

const read = (file) => {
  if (!cache.has(file)) {
    try {
      // Strip a UTF-8 BOM: PowerShell and some editors write one, and it breaks JSON.parse.
      cache.set(file, readFileSync(file, 'utf8').replace(/^\uFEFF/, ''))
    } catch {
      cache.set(file, '')
    }
  }
  return cache.get(file)
}

const lineAt = (text, index) => {
  let line = 1
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1
  }
  return line
}

const snippet = (text, index) => {
  const start = text.lastIndexOf('\n', index - 1) + 1
  const end = text.indexOf('\n', index)
  const line = text.slice(start, end === -1 ? text.length : end)
  return line.trim().slice(0, 120)
}

// Report paths relative to the scanned root, so output is readable from any cwd.
const relTo = (file) => {
  for (const root of roots) {
    const base = resolve(root)
    const prefix = base.endsWith(sep) ? base : base + sep
    if (file.startsWith(prefix)) return file.slice(prefix.length).split(sep).join('/')
  }
  return relative(process.cwd(), file).split(sep).join('/') || basename(file)
}

const hit = (file, text, index) => ({
  file: relTo(file),
  line: lineAt(text, index),
  snippet: snippet(text, index),
})

// Match every occurrence of a global regex in one file.
const scan = (rule, why, tester) => {
  const hits = []
  for (const file of files) {
    const text = read(file)
    if (!text) continue
    hits.push(...tester(text, file))
  }
  add(rule.level, rule.rule, why, hits)
}

const eachMatch = (text, file, re, build) => {
  const out = []
  re.lastIndex = 0
  let m
  while ((m = re.exec(text)) !== null) {
    out.push(build(m, file, text))
    if (m.index === re.lastIndex) re.lastIndex += 1
  }
  return out
}

const keyframeBlocks = (text) => {
  const blocks = []
  const re = /@keyframes\s+([\w-]+)\s*\{/g
  let m
  while ((m = re.exec(text)) !== null) {
    let depth = 0
    let i = m.index + m[0].length - 1
    const start = i
    for (; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1
      else if (text[i] === '}') {
        depth -= 1
        if (depth === 0) break
      }
    }
    blocks.push({ name: m[1], index: start, body: text.slice(start, i + 1) })
  }
  return blocks
}

// ── 1. two animation families in one project ─────────────────────────────────

const familiesFound = new Map()

for (const file of files) {
  const text = read(file)
  if (!text) continue
  const re = /(?:from\s*|require\(\s*|import\s*\(\s*)['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(text)) !== null) {
    const spec = m[1]
    for (const family of FAMILIES) {
      if (!family.re.test(spec)) continue
      if (!familiesFound.has(family.name)) familiesFound.set(family.name, [])
      familiesFound.get(family.name).push(hit(file, text, m.index))
    }
  }
}

if (familiesFound.size > 1) {
  const names = [...familiesFound.keys()]
  findings.push({
    level: 'FAIL',
    rule: 'two animation libraries in one project',
    why: `Found ${names.join(', ')}. Two DOM-animation libraries means two motion languages, two debugging models and two bundle costs. Pick one, or ask the user which one is authoritative, and record the decision.`,
    hits: names.flatMap((n) => familiesFound.get(n).slice(0, 1)),
  })
} else if (familiesFound.size === 0) {
  skip('animation library conflict', 'no known DOM-animation library imported — CSS, hand-rolled or none')
}

// ── 2. more than one render loop in a file ───────────────────────────────────

scan(
  { level: 'FAIL', rule: 'more than one requestAnimationFrame in a file' },
  'Every per-frame subscriber joins one shared loop. A component that starts its own rAF, or calls it more than once, is a second loop — see docs/per-frame-architecture.md. Files that own a ticker are exempt.',
  (text, file) => {
    if (TICKER_FILE.test(basename(file))) return []
    const hits = []
    eachMatch(text, file, /requestAnimationFrame\s*\(/g, (m) => hits.push(hit(file, text, m.index)))
    return hits.length > 1 ? hits : []
  },
)

// ── 3. transition on a layout property ───────────────────────────────────────

scan(
  { level: 'FAIL', rule: 'transition on a layout property' },
  'Animating width, height, top, left, margin or padding runs layout on every frame. Animate transform and opacity instead — see docs/perf-budget.md.',
  (text, file) => {
    const out = []
    eachMatch(text, file, /transition(?:-property)?\s*:\s*([^;{}]+)[;}]/g, (m) => {
      if (LAYOUT_RE.test(m[1])) out.push(hit(file, text, m.index))
    })
    return out
  },
)

// ── 4. keyframes animating a layout property ─────────────────────────────────

scan(
  { level: 'WARN', rule: 'keyframe animating a layout property' },
  'Keyframes are fine for one-shot decoration. Animating width/height/top/margin inside one forces layout every frame and cannot be interrupted. Animate a transform instead.',
  (text, file) => {
    const out = []
    for (const block of keyframeBlocks(text)) {
      const layoutInBody = new RegExp(`(?:^|[;{\\s])(?:${LAYOUT_PROPS})\\s*:`)
      if (layoutInBody.test(block.body)) {
        out.push({ ...hit(file, text, block.index), snippet: `@keyframes ${block.name}` })
      }
    }
    return out
  },
)

// ── 5. listener added, never removed ─────────────────────────────────────────

scan(
  { level: 'WARN', rule: 'event listener with no matching cleanup in this file' },
  'An animation that outlives its component is a leak. Return a cleanup that calls removeEventListener, disconnects observers and kills animation contexts — see docs/per-frame-architecture.md.',
  (text, file) => {
    const added = (text.match(/addEventListener\s*\(/g) || []).length
    if (added === 0) return []
    const removed = (text.match(/removeEventListener\s*\(/g) || []).length
    if (removed >= added) return []
    const at = text.search(/addEventListener\s*\(/)
    return [{ ...hit(file, text, at), snippet: `${added} added, ${removed} removed` }]
  },
)

// ── 6. click handler on a non-interactive element ────────────────────────────

scan(
  { level: 'WARN', rule: 'click handler on a non-interactive element' },
  'A button does something, a link goes somewhere. A click-handler div is unreachable by keyboard and invisible to assistive tech — use a real button.',
  (text, file) =>
    eachMatch(text, file, /<(div|span)\b[^>]{0,400}?(?:onClick|@click|on:click)/g, (m) =>
      hit(file, text, m.index),
    ),
)

// ── 7. image without alt ─────────────────────────────────────────────────────

scan(
  { level: 'WARN', rule: 'image without alt' },
  'Every image needs alt text; a decorative one takes alt="" explicitly. Omission means a screen reader announces the filename.',
  (text, file) =>
    eachMatch(text, file, /<(?:img|Image)\b[^>]{0,600}?\/?>/g, (m) =>
      /\balt\s*=/.test(m[0]) ? null : hit(file, text, m.index),
    ).filter(Boolean),
)

// ── 8. tight leading with clipped overflow ───────────────────────────────────

scan(
  { level: 'WARN', rule: 'leading-none combined with clipped overflow' },
  'A clip box is the line-height box, so leading below 1.1 shaves descenders and accented capitals. Use 1.1 as the floor — see docs/text-motion.md.',
  (text, file) => {
    const out = []
    for (const line of text.split('\n')) {
      if (!line.includes('leading-none')) continue
      if (!/overflow-(hidden|clip)|overflow\s*:\s*(hidden|clip)/.test(line)) continue
      out.push({ ...hit(file, text, text.indexOf(line)), snippet: line.trim().slice(0, 120) })
    }
    return out
  },
)

// ── 9. utilities that compile to nothing in Tailwind v4 ──────────────────────

const findPackageJson = (start) => {
  let dir = resolve(start)
  for (let i = 0; i < 5; i += 1) {
    try {
      return JSON.parse(read(join(dir, 'package.json')))
    } catch {
      const parent = resolve(dir, '..')
      if (parent === dir) break
      dir = parent
    }
  }
  return null
}

let tailwind = false
for (const candidate of [process.cwd(), ...roots.map((r) => resolve(r))]) {
  const pkg = findPackageJson(candidate)
  if (!pkg) continue
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  if (deps.tailwindcss) tailwind = true
}

if (tailwind) {
  scan(
    { level: 'WARN', rule: 'bare duration utility' },
    'Tailwind v4 has no --duration-* namespace, so duration-fast as a bare class compiles to nothing. Use duration-[var(--duration-fast)] with a token.',
    (text, file) =>
      eachMatch(text, file, /\bduration-(?:fast|normal|slow)\b/g, (m) => hit(file, text, m.index)),
  )
} else {
  skip('bare duration utility', 'Tailwind not detected in package.json')
}

// ── 10. will-change overuse ──────────────────────────────────────────────────

scan(
  { level: 'WARN', rule: 'will-change used more than five times' },
  'Every will-change promotes a layer permanently and costs memory. Apply it around the animation and remove it — see docs/perf-budget.md.',
  (text, file) => {
    const hits = []
    eachMatch(text, file, /will-?change/gi, (m) => hits.push(hit(file, text, m.index)))
    return hits.length > 5 ? hits : []
  },
)

// ── 11. console.log ──────────────────────────────────────────────────────────

scan(
  { level: 'WARN', rule: 'console.log in source' },
  'Remove debug logging before reporting done.',
  (text, file) =>
    eachMatch(text, file, /console\.(?:log|debug)\s*\(/g, (m) => hit(file, text, m.index)),
)

// ── 12. reduced motion ───────────────────────────────────────────────────────

const ANIMATES = /@keyframes|requestAnimationFrame|whileInView|ScrollTrigger|IntersectionObserver|transition\s*:|\banimate\b/
const animatingFiles = files.filter((f) => ANIMATES.test(read(f)))
const reducedMotionHandled = files.some((f) => /prefers-reduced-motion/.test(read(f)))

if (animatingFiles.length === 0) {
  skip('reduced-motion handling', 'nothing in scope animates')
} else if (!reducedMotionHandled) {
  add(
    'WARN',
    'no prefers-reduced-motion handling found',
    'Motion is present but reduced motion is never honoured. It must jump to the end state: final position, final opacity, content readable.',
    [{ file: relTo(animatingFiles[0]), line: 1, snippet: '' }],
  )
}

// ── report ───────────────────────────────────────────────────────────────────

const fails = findings.filter((f) => f.level === 'FAIL')
const warns = findings.filter((f) => f.level === 'WARN')
const skipped = findings.filter((f) => f.level === 'SKIP')

if (json) {
  console.log(
    JSON.stringify(
      {
        scope: { roots: roots.map((r) => resolve(r)), files: files.length },
        totals: { fail: fails.length, warn: warns.length, skip: skipped.length },
        findings,
      },
      null,
      2,
    ),
  )
} else {
  const tty = process.stdout.isTTY && !process.env.NO_COLOR
  const paint = (code, s) => (tty ? `\u001b[${code}m${s}\u001b[0m` : s)
  const red = (s) => paint(31, s)
  const yellow = (s) => paint(33, s)
  const green = (s) => paint(32, s)
  const dim = (s) => paint(2, s)

  console.log(dim('── scope ─────────────────────────────────────────────────────'))
  console.log(`  ${files.length} source files under ${roots.map((r) => resolve(r)).join(', ')}`)
  console.log('')

  if (files.length === 0) {
    console.log(dim('  nothing to scan — check the path you passed.'))
    console.log('')
  }

  for (const f of findings) {
    if (f.level === 'SKIP') {
      if (!quiet) console.log(dim(`SKIP  ${f.rule} — ${f.why}`))
      continue
    }
    const tag = f.level === 'FAIL' ? red('FAIL') : yellow('WARN')
    console.log(`${tag}  ${f.rule}`)
    console.log(dim(`      ${f.why}`))
    for (const h of f.hits.slice(0, 20)) {
      console.log(`      ${h.file}:${h.line}  ${h.snippet}`)
    }
    if (f.hits.length > 20) console.log(dim(`      … and ${f.hits.length - 20} more`))
    console.log('')
  }

  const summary = `${fails.length} FAIL / ${warns.length} WARN / ${skipped.length} SKIP`
  if (fails.length > 0) {
    console.log(red(`${summary} — every FAIL must be fixed.`))
    console.log(dim('Then the judgement checks in docs/visual-qa.md, and the project lint, typecheck and build.'))
  } else {
    console.log(green(`${summary} — mechanical motion audit passed.`))
    console.log(dim('WARN is a judgement call: fix it or justify it. SKIP means the check could not apply.'))
    console.log(dim('This is the floor. Layer 2 of docs/visual-qa.md is the rest.'))
  }
}

process.exit(fails.length > 0 ? 1 : 0)