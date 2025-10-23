import React, { useEffect, useMemo, useRef, useState } from 'react'

// Simple 2D physics for a handful of boxes (the letters). No external deps.
// - Gravity
// - AABB collisions (box-box, walls, and floor)
// - Drag and drop with velocity carry-over

const LETTERS = [
  { ch: 'G', color: '#4285F4' }, // Blue
  { ch: 'o', color: '#DB4437' }, // Red
  { ch: 'o', color: '#F4B400' }, // Yellow
  { ch: 'g', color: '#4285F4' }, // Blue
  { ch: 'l', color: '#0F9D58' }, // Green
  { ch: 'e', color: '#DB4437' }, // Red
]

const FONT_STACK = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"'

export default function PhysicsGoogle() {
  const containerRef = useRef(null)
  const measureRefs = useRef([])
  const [sizes, setSizes] = useState(null)
  const [released, setReleased] = useState(false)
  const bodiesRef = useRef([])
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0, lastX: 0, lastY: 0 })

  // measure letter widths/heights once mounted
  useEffect(() => {
    if (!containerRef.current) return
    // Build hidden measurers then read sizes next frame
    const measure = () => {
      const rects = measureRefs.current.map((el) => {
        if (!el) return { width: 0, height: 0 }
        const r = el.getBoundingClientRect()
        return { width: Math.ceil(r.width), height: Math.ceil(r.height) }
      })
      setSizes(rects)
    }
    const id = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(id)
  }, [])

  // initialize bodies when sizes are known
  useEffect(() => {
    if (!sizes || !containerRef.current) return
    const wrap = containerRef.current
    const { width: W, height: H } = wrap.getBoundingClientRect()

    const totalWidth = sizes.reduce((acc, s) => acc + s.width, 0)
    const gap = Math.round(0.02 * W) // small kerning spacing for aesthetics
    const totalGap = gap * (sizes.length - 1)
    const full = totalWidth + totalGap
    let x = (W - full) / 2
    const y = H * 0.28 // initial logo baseline height

    bodiesRef.current = sizes.map((s, i) => {
      const bx = x
      x += s.width + gap
      return {
        id: i,
        x: bx,
        y: y - s.height, // top-left
        w: s.width,
        h: s.height,
        vx: 0,
        vy: 0,
        color: LETTERS[i].color,
        ch: LETTERS[i].ch,
        isDragged: false,
      }
    })
    // no animation until released
    stopLoop()
  }, [sizes])

  // physics loop
  useEffect(() => {
    if (!released) return
    startLoop()
    return stopLoop
  }, [released])

  const startLoop = () => {
    if (rafRef.current) return
    lastTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }

  const stopLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }

  const tick = (t) => {
    const dt = Math.min(0.032, Math.max(0.001, (t - lastTimeRef.current) / 1000))
    lastTimeRef.current = t
    stepPhysics(dt)
    rafRef.current = requestAnimationFrame(tick)
  }

  const stepPhysics = (dt) => {
    const wrap = containerRef.current
    if (!wrap) return
    const { width: W, height: H } = wrap.getBoundingClientRect()

    const g = 2600 // px/s^2
    const restitution = 0.18
    const friction = 0.98

    const bodies = bodiesRef.current

    // integrate
    for (const b of bodies) {
      if (b.isDragged) continue
      b.vy += g * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
    }

    // walls and floor
    for (const b of bodies) {
      if (b.isDragged) continue
      // floor
      const floor = H - 24 // soft padding from bottom
      if (b.y + b.h > floor) {
        b.y = floor - b.h
        if (b.vy > 0) b.vy = -b.vy * restitution
        b.vx *= friction
      }
      // ceiling
      if (b.y < 0) {
        b.y = 0
        if (b.vy < 0) b.vy = -b.vy * restitution
      }
      // left/right walls
      if (b.x < 0) {
        b.x = 0
        if (b.vx < 0) b.vx = -b.vx * restitution
      }
      if (b.x + b.w > W) {
        b.x = W - b.w
        if (b.vx > 0) b.vx = -b.vx * restitution
      }
    }

    // pairwise collisions (naive N^2)
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]
        const b = bodies[j]
        if (a.isDragged && b.isDragged) continue
        if (!overlap(a, b)) continue
        // compute minimum translation vector separate along axis of least penetration
        const px = Math.min(a.x + a.w - b.x, b.x + b.w - a.x)
        const py = Math.min(a.y + a.h - b.y, b.y + b.h - a.y)

        if (px < py) {
          // separate in x
          const dir = a.x < b.x ? -1 : 1
          const move = px / 2
          if (!a.isDragged) a.x += dir * move
          if (!b.isDragged) b.x -= dir * move
          // swap/reflect x velocities
          const avx = a.vx
          const bvx = b.vx
          if (!a.isDragged) a.vx = (bvx - avx) * restitution + bvx * 0.5
          if (!b.isDragged) b.vx = (avx - bvx) * restitution + avx * 0.5
          if (!a.isDragged) a.vx *= friction
          if (!b.isDragged) b.vx *= friction
        } else {
          // separate in y
          const dir = a.y < b.y ? -1 : 1
          const move = py / 2
          if (!a.isDragged) a.y += dir * move
          if (!b.isDragged) b.y -= dir * move
          const avy = a.vy
          const bvy = b.vy
          if (!a.isDragged) a.vy = (bvy - avy) * restitution + bvy * 0.5
          if (!b.isDragged) b.vy = (avy - bvy) * restitution + avy * 0.5
          if (!a.isDragged) a.vx *= friction
          if (!b.isDragged) b.vx *= friction
        }
      }
    }

    // request re-render via state by toggling a key; but we'll rely on inline styles by reading bodies in JSX
    // force update by using a dummy state? Instead, we can update a ref and set a state counter.
    setRenderTick((t) => t + 1)
  }

  const [renderTick, setRenderTick] = useState(0)

  const onGlobalPointerDown = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Find topmost letter under pointer for dragging
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // check hit test from top (end) to start to simulate z-order
    const bodies = bodiesRef.current
    for (let i = bodies.length - 1; i >= 0; i--) {
      const b = bodies[i]
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        draggingRef.current = { id: b.id, offsetX: x - b.x, offsetY: y - b.y, lastX: x, lastY: y }
        b.isDragged = true
        b.vx = 0
        b.vy = 0
        setRenderTick((t) => t + 1)
        return
      }
    }

    // if not dragging a letter, trigger release
    if (!released) setReleased(true)
  }

  const onGlobalPointerMove = (e) => {
    const wrap = containerRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const data = draggingRef.current
    if (data.id === null) return
    const bodies = bodiesRef.current
    const b = bodies[data.id]
    if (!b) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const nx = x - data.offsetX
    const ny = y - data.offsetY

    const dtX = x - data.lastX
    const dtY = y - data.lastY

    b.x = Math.max(0, Math.min(rect.width - b.w, nx))
    b.y = Math.max(0, Math.min(rect.height - b.h, ny))
    b.vx = dtX * 60 // approximate px/frame -> px/s
    b.vy = dtY * 60

    draggingRef.current.lastX = x
    draggingRef.current.lastY = y
    setRenderTick((t) => t + 1)
  }

  const onGlobalPointerUp = () => {
    const data = draggingRef.current
    if (data.id === null) return
    const b = bodiesRef.current[data.id]
    if (b) b.isDragged = false
    draggingRef.current = { id: null, offsetX: 0, offsetY: 0, lastX: 0, lastY: 0 }
    if (!released) setReleased(true)
  }

  // Click anywhere to release: attach events on container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const opts = { passive: false }
    el.addEventListener('pointerdown', onGlobalPointerDown, opts)
    window.addEventListener('pointermove', onGlobalPointerMove, opts)
    window.addEventListener('pointerup', onGlobalPointerUp, opts)

    return () => {
      el.removeEventListener('pointerdown', onGlobalPointerDown, opts)
      window.removeEventListener('pointermove', onGlobalPointerMove, opts)
      window.removeEventListener('pointerup', onGlobalPointerUp, opts)
    }
  }, [released])

  // Recalculate bounds on resize (no reset of positions)
  useEffect(() => {
    const onResize = () => setRenderTick((t) => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Render hidden measurers to get true per-letter sizes at chosen font-size
  const fontSize = useMemo(() => {
    if (typeof window === 'undefined') return 96
    const w = window.innerWidth
    if (w < 400) return 68
    if (w < 640) return 84
    if (w < 1024) return 96
    return 112
  }, [renderTick])

  return (
    <div ref={containerRef} className="absolute inset-0 select-none" style={{ touchAction: 'none' }}>
      {/* Hidden measurers */}
      <div className="absolute -z-10 opacity-0 pointer-events-none" aria-hidden>
        {LETTERS.map((l, i) => (
          <span
            key={i}
            ref={(el) => (measureRefs.current[i] = el)}
            style={{ fontFamily: FONT_STACK, fontSize: fontSize, fontWeight: 600, letterSpacing: '-0.02em', display: 'inline-block' }}
          >
            {l.ch}
          </span>
        ))}
      </div>

      {/* Letters (positioned) */}
      {bodiesRef.current.map((b) => (
        <div
          key={b.id}
          className="absolute will-change-transform"
          style={{
            transform: `translate(${b.x}px, ${b.y}px)`,
            width: b.w,
            height: b.h,
            cursor: 'grab',
          }}
        >
          <span
            style={{
              color: b.color,
              fontFamily: FONT_STACK,
              fontSize: fontSize,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              userSelect: 'none',
              display: 'inline-block',
            }}
          >
            {b.ch}
          </span>
        </div>
      ))}

      {/* Instruction overlay */}
      {!released && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="mt-28 text-sm md:text-base text-neutral-500 bg-white/70 rounded-full px-4 py-2 shadow-sm">
            Click anywhere to let the letters fall. Drag letters around after they stack.
          </div>
        </div>
      )}
    </div>
  )
}

function overlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
}
