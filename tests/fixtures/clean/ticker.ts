// A file that owns the render loop is allowed more than one rAF call.
let raf = 0

export const start = () => {
  raf = requestAnimationFrame(tick)
}

export const restart = () => {
  raf = requestAnimationFrame(tick)
}

const tick = () => {
  raf = requestAnimationFrame(tick)
}