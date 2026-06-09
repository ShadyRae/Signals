import { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export default function StarField() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 3,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.6,
    }))
  }, [])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      <style>{`
        .starfield {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          background: #f5f0e8;
          animation: twinkle var(--duration, 3s) ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: var(--opacity, 0.5); transform: scale(1); }
          50% { opacity: calc(var(--opacity, 0.5) * 0.2); transform: scale(0.6); }
        }
      `}</style>
    </div>
  )
}
