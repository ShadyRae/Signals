import type { Fortune } from '../../types/database'

type DrawState = 'idle' | 'drawing' | 'revealed'

interface Props {
  fortune: Fortune | null
  drawState: DrawState
  isDaily: boolean
}

function highlightBody(body: string, word: string) {
  if (!word) return <>{body}</>
  const regex = new RegExp(`(${word})`, 'i')
  const parts = body.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <span key={i} className="highlight-word">{part}</span>
          : part
      )}
    </>
  )
}

export default function FortuneCard({ fortune, drawState, isDaily }: Props) {
  return (
    <div className={`fortune-card-wrap ${drawState}`}>
      {/* Smoke tendrils */}
      <div className="tendril tendril-left" />
      <div className="tendril tendril-right" />

      <div className="fortune-card">
        {/* Corner medallions */}
        <div className="corner corner-tl"><StarIcon /></div>
        <div className="corner corner-tr"><StarIcon /></div>
        <div className="corner corner-bl"><StarIcon /></div>
        <div className="corner corner-br"><StarIcon /></div>

        {/* Top star */}
        <div className="card-top-star"><StarIcon size={14} /></div>

        {drawState === 'drawing' && (
          <div className="drawing-state">
            <div className="drawing-pulse" />
            <p className="drawing-text">receiving your signal...</p>
          </div>
        )}

        {drawState === 'idle' && (
          <div className="idle-state">
            <p className="idle-text">Your signal awaits.</p>
            <p className="idle-sub">Tap Daily Fortune to receive your message.</p>
          </div>
        )}

        {drawState === 'revealed' && fortune && (
          <div className="revealed-state">
            {isDaily && <p className="daily-badge">✦ DAILY SIGNAL</p>}
            <h2 className="fortune-title">{fortune.title}</h2>
            <div className="card-divider">
              <span>◑</span><span>◐</span><span>●</span><span>◑</span><span>◐</span>
            </div>
            <p className="fortune-body">
              {highlightBody(fortune.body, fortune.highlight_word)}
            </p>
            <div className="fortune-category">{fortune.category.toUpperCase()}</div>
          </div>
        )}
      </div>

      <style>{`
        .fortune-card-wrap {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* SMOKE TENDRILS */
        .tendril {
          position: absolute;
          width: 30px;
          height: 220px;
          top: 20px;
          background: linear-gradient(to top, transparent, rgba(124, 58, 237, 0.25), transparent);
          border-radius: 50%;
          filter: blur(12px);
          pointer-events: none;
          animation: tendrilDrift 8s ease-in-out infinite;
        }

        .tendril-left { left: -10px; }
        .tendril-right { right: -10px; animation-delay: -4s; }

        @keyframes tendrilDrift {
          0%, 100% { transform: scaleX(1) translateY(0); opacity: 0.4; }
          50% { transform: scaleX(1.4) translateY(-10px); opacity: 0.7; }
        }

        /* CARD */
        .fortune-card {
          width: 100%;
          min-height: 300px;
          border: 1.5px solid rgba(212, 168, 83, 0.35);
          border-radius: 8px;
          background: rgba(13, 8, 32, 0.85);
          backdrop-filter: blur(8px);
          padding: 28px 24px;
          position: relative;
          box-shadow:
            0 0 0 1px rgba(124, 58, 237, 0.1),
            0 0 30px rgba(124, 58, 237, 0.15),
            inset 0 0 40px rgba(124, 58, 237, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .revealed .fortune-card {
          animation: cardReveal 0.6s ease-out forwards;
          box-shadow:
            0 0 0 1px rgba(124, 58, 237, 0.2),
            0 0 50px rgba(124, 58, 237, 0.25),
            inset 0 0 40px rgba(124, 58, 237, 0.08);
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* CORNERS */
        .corner {
          position: absolute;
          opacity: 0.6;
        }
        .corner-tl { top: 10px; left: 10px; }
        .corner-tr { top: 10px; right: 10px; }
        .corner-bl { bottom: 10px; left: 10px; }
        .corner-br { bottom: 10px; right: 10px; }

        .card-top-star {
          margin-bottom: 12px;
          opacity: 0.8;
          animation: starSpin 12s linear infinite;
        }

        @keyframes starSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* DRAWING STATE */
        .drawing-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 20px;
        }

        .drawing-pulse {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.3);
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          50% { transform: scale(1.3); opacity: 1; box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
        }

        .drawing-text {
          font-size: 12px;
          letter-spacing: 0.15em;
          color: rgba(167, 139, 250, 0.7);
          font-style: italic;
          font-family: Georgia, serif;
        }

        /* IDLE STATE */
        .idle-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 12px;
          text-align: center;
        }

        .idle-text {
          font-size: 18px;
          color: rgba(245, 240, 232, 0.6);
          font-family: Georgia, serif;
        }

        .idle-sub {
          font-size: 12px;
          color: rgba(155, 143, 168, 0.5);
          letter-spacing: 0.05em;
          font-family: Georgia, serif;
        }

        /* REVEALED STATE */
        .revealed-state {
          width: 100%;
          text-align: center;
          animation: fadeUp 0.5s ease-out 0.2s both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .daily-badge {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(212, 168, 83, 0.5);
          margin-bottom: 10px;
          font-family: Georgia, serif;
        }

        .fortune-title {
          font-size: 22px;
          font-weight: normal;
          color: #f5f0e8;
          font-family: Georgia, serif;
          letter-spacing: 0.02em;
          margin-bottom: 14px;
          line-height: 1.3;
          text-shadow: 0 0 30px rgba(124, 58, 237, 0.3);
        }

        .card-divider {
          display: flex;
          justify-content: center;
          gap: 6px;
          color: rgba(212, 168, 83, 0.5);
          font-size: 10px;
          margin-bottom: 16px;
          letter-spacing: 0.1em;
        }

        .fortune-body {
          font-size: 14px;
          line-height: 1.8;
          color: rgba(245, 240, 232, 0.85);
          font-family: Georgia, serif;
          text-align: center;
          margin-bottom: 16px;
        }

        .highlight-word {
          color: #d4a853;
          font-style: italic;
        }

        .fortune-category {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(167, 139, 250, 0.5);
          font-family: Georgia, serif;
        }
      `}</style>
    </div>
  )
}

function StarIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M5 0L5.9 4.1L10 5L5.9 5.9L5 10L4.1 5.9L0 5L4.1 4.1Z" fill="#d4a853"/>
    </svg>
  )
}
