import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

/**
 * AnimatedBackground — canvas particle field (neon purple/cyan motes with
 * connecting threads) layered over drifting gradient blobs. Adapts to theme.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w = 0
    let h = 0
    let raf = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = Math.min(90, Math.floor((w * h) / 22000))
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 2.2,
      hue: Math.random() < 0.55 ? 275 : 190, // purple | cyan
      tw: Math.random() * Math.PI * 2, // twinkle phase
    }))

    const onMouse = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseout', onLeave)

    const LINK_DIST = 130

    const tick = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.tw += 0.02
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // gentle parallax away from the cursor
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < 140 && dist > 1) {
          p.x += (dx / dist) * 0.6
          p.y += (dy / dist) * 0.6
        }

        const alpha = 0.35 + 0.3 * Math.sin(p.tw)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${isDark ? 65 : 45}%, ${alpha})`
        ctx.fill()
      }

      // connecting threads
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * (isDark ? 0.14 : 0.1)
            ctx.strokeStyle = `hsla(265, 85%, 65%, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [isDark])

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* drifting gradient blobs */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-purple-500/25 dark:bg-purple-600/25 blur-[120px] animate-blob" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-cyan-400/20 dark:bg-cyan-500/15 blur-[120px] animate-blob [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-fuchsia-500/15 dark:bg-fuchsia-600/15 blur-[120px] animate-blob [animation-delay:-12s]" />
      {/* particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* faint grid overlay for the hacker vibe */}
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,85,247,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)',
        }}
      />
    </div>
  )
}
