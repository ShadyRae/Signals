import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Fortune } from '../types/database'
import StarField from './StarField'
import CrystalBall from './CrystalBall'
import FortuneCard from './FortuneCard'
import BottomNav from './BottomNav'

function cryptoRandom(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

type DrawState = 'idle' | 'drawing' | 'revealed'

export default function FortunePage() {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [queriesRemaining, setQueriesRemaining] = useState(3)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [allEmpty, setAllEmpty] = useState(false)
  const [isDaily, setIsDaily] = useState(false)

  // Load seen IDs from localStorage (guest mode)
  useEffect(() => {
    const stored = localStorage.getItem('signals_seen_ids')
    if (stored) setSeenIds(JSON.parse(stored))

    const storedQueries = localStorage.getItem('signals_queries_date')
    const today = new Date().toDateString()
    if (storedQueries === today) {
      const used = parseInt(localStorage.getItem('signals_queries_used') || '0')
      setQueriesRemaining(3 - used)
    } else {
      localStorage.setItem('signals_queries_date', today)
      localStorage.setItem('signals_queries_used', '0')
      setQueriesRemaining(3)
    }

    // Auto-draw daily fortune on load
    drawDaily()
  }, [])

  const drawDaily = useCallback(async () => {
    const todayKey = `signals_daily_${new Date().toDateString()}`
    const storedDailyId = localStorage.getItem(todayKey)

    if (storedDailyId) {
      // Already drew today — fetch the same card
      const { data } = await supabase
        .from('fortunes')
        .select('*')
        .eq('id', storedDailyId)
        .single()
      if (data) {
        setFortune(data as Fortune)
        setDrawState('revealed')
        setIsDaily(true)
        return
      }
    }

    await drawFortune(true)
  }, [])

  const drawFortune = async (daily = false) => {
    setDrawState('drawing')
    setFortune(null)

    try {
      const { data: allFortunes } = await supabase
        .from('fortunes')
        .select('id')
        .eq('is_active', true)

      if (!allFortunes || allFortunes.length === 0) return

      const allIds = allFortunes.map(f => f.id)
      const currentSeen = JSON.parse(localStorage.getItem('signals_seen_ids') || '[]')
      const unseen = allIds.filter((id: string) => !currentSeen.includes(id))

      if (unseen.length === 0) {
        setAllEmpty(true)
        setDrawState('idle')
        return
      }

      const selectedId = unseen[cryptoRandom(unseen.length)]
      const { data: selectedFortune } = await supabase
        .from('fortunes')
        .select('*')
        .eq('id', selectedId)
        .single()

      if (selectedFortune) {
        // Save to seen
        const newSeen = [...currentSeen, selectedId]
        localStorage.setItem('signals_seen_ids', JSON.stringify(newSeen))
        setSeenIds(newSeen)

        if (daily) {
          const todayKey = `signals_daily_${new Date().toDateString()}`
          localStorage.setItem(todayKey, selectedId)
          setIsDaily(true)
        } else {
          setIsDaily(false)
          const used = parseInt(localStorage.getItem('signals_queries_used') || '0') + 1
          localStorage.setItem('signals_queries_used', String(used))
          setQueriesRemaining(3 - used)
        }

        await new Promise(r => setTimeout(r, 1800))
        setFortune(selectedFortune as Fortune)
        setDrawState('revealed')
      }
    } catch (err) {
      console.error('Draw error:', err)
      setDrawState('idle')
    }
  }

  const handleRevealAnother = () => {
    if (queriesRemaining <= 0) return
    drawFortune(false)
  }

  const handleDailyFortune = () => {
    drawDaily()
  }

  const resetPool = () => {
    localStorage.removeItem('signals_seen_ids')
    setSeenIds([])
    setAllEmpty(false)
    drawFortune(true)
  }

  return (
    <div className="signals-app">
      <StarField />

      <div className="signals-content">
        {/* Arch Header */}
        <div className="arch-header">
          <div className="arch-moon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L24 4 M24 44 L24 40 M8 24 L4 24 M44 24 L40 24" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M30 18 C30 26 24 32 16 30 C20 38 32 36 36 28 C38 22 35 14 30 18Z" fill="#d4a853" opacity="0.9"/>
              <circle cx="24" cy="24" r="2" fill="#d4a853"/>
            </svg>
          </div>
          <p className="arch-label">MEANT FOR YOU</p>
          <h1 className="arch-title">Your Fortune</h1>
          <p className="arch-subtitle">TRUST THE MOMENT</p>
        </div>

        {/* Fortune Card Area */}
        <div className="card-area">
          {allEmpty ? (
            <div className="empty-state">
              <p className="empty-title">You've received every signal.</p>
              <p className="empty-sub">Your pool resets when you're ready.</p>
              <button className="reset-btn" onClick={resetPool}>Reset My Pool</button>
            </div>
          ) : (
            <FortuneCard fortune={fortune} drawState={drawState} isDaily={isDaily} />
          )}
        </div>

        {/* Crystal Ball */}
        <CrystalBall drawState={drawState} />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className={`action-btn ${queriesRemaining <= 0 ? 'disabled' : ''}`}
            onClick={handleRevealAnother}
            disabled={queriesRemaining <= 0 || drawState === 'drawing'}
          >
            <div className="action-btn-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L10.9 7.1L16 7L11.8 10.2L13.5 15L10 12L6.5 15L8.2 10.2L4 7L9.1 7.1Z" fill="#d4a853"/>
              </svg>
            </div>
            <span className="action-btn-label">REVEAL<br/>ANOTHER</span>
          </button>

          <div className="queries-counter">
            {queriesRemaining > 0
              ? `${queriesRemaining} of 3 signals remaining`
              : 'Come back tomorrow'}
          </div>

          <button
            className="action-btn"
            onClick={handleDailyFortune}
            disabled={drawState === 'drawing'}
          >
            <div className="action-btn-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C10 2 10 10 10 10C10 10 18 10 18 10C18 5.6 14.4 2 10 2Z" fill="#d4a853" opacity="0.6"/>
                <path d="M10 18C14.4 18 18 14.4 18 10L10 10Z" fill="#d4a853" opacity="0.8"/>
                <path d="M2 10C2 14.4 5.6 18 10 18L10 10Z" fill="#d4a853"/>
                <path d="M10 2C5.6 2 2 5.6 2 10L10 10Z" fill="#d4a853" opacity="0.4"/>
              </svg>
            </div>
            <span className="action-btn-label">DAILY<br/>FORTUNE</span>
          </button>
        </div>

        {/* Synchronicity label */}
        <div className="sync-label">
          <span className="sync-title">SYNCHRONICITY</span>
          <p className="sync-text">This fortune is randomly generated in this exact moment for you.</p>
        </div>
      </div>

      <BottomNav active="fortune" />

      <style>{`
        .signals-app {
          min-height: 100vh;
          min-height: 100dvh;
          background: radial-gradient(ellipse at 50% 30%, #1e0a4a 0%, #0d0820 40%, #07050f 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .signals-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px 100px;
          position: relative;
          z-index: 10;
          max-width: 430px;
          margin: 0 auto;
          width: 100%;
        }

        /* ARCH HEADER */
        .arch-header {
          text-align: center;
          padding-top: 48px;
          padding-bottom: 16px;
          position: relative;
        }

        .arch-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 120px;
          border: 1px solid rgba(212, 168, 83, 0.2);
          border-bottom: none;
          border-radius: 100px 100px 0 0;
          pointer-events: none;
        }

        .arch-moon {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
          animation: moonPulse 4s ease-in-out infinite;
        }

        @keyframes moonPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .arch-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(212, 168, 83, 0.5);
          font-family: Georgia, serif;
          margin-bottom: 6px;
        }

        .arch-title {
          font-size: 36px;
          font-weight: normal;
          color: #f5f0e8;
          font-family: Georgia, serif;
          letter-spacing: 0.02em;
          margin-bottom: 6px;
          text-shadow: 0 0 40px rgba(124, 58, 237, 0.4);
        }

        .arch-subtitle {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(212, 168, 83, 0.5);
          font-family: Georgia, serif;
        }

        /* CARD AREA */
        .card-area {
          width: 100%;
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 8px 0;
        }

        /* EMPTY STATE */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          border: 1px solid rgba(212, 168, 83, 0.3);
          border-radius: 12px;
        }

        .empty-title {
          font-size: 18px;
          color: #f5f0e8;
          margin-bottom: 8px;
          font-family: Georgia, serif;
        }

        .empty-sub {
          font-size: 13px;
          color: #9b8fa8;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }

        .reset-btn {
          padding: 10px 24px;
          border: 1px solid #d4a853;
          background: transparent;
          color: #d4a853;
          font-family: Georgia, serif;
          letter-spacing: 0.1em;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
        }

        /* ACTION BUTTONS */
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: -10px;
          position: relative;
          z-index: 20;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .action-btn.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .action-btn-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1.5px solid rgba(212, 168, 83, 0.6);
          background: rgba(7, 5, 15, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 0 12px rgba(212, 168, 83, 0.1);
        }

        .action-btn:not(.disabled):active .action-btn-icon {
          transform: scale(0.95);
          border-color: #d4a853;
          box-shadow: 0 0 20px rgba(212, 168, 83, 0.3);
        }

        .action-btn-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: rgba(212, 168, 83, 0.7);
          font-family: Georgia, serif;
          text-align: center;
          line-height: 1.4;
        }

        .queries-counter {
          font-size: 10px;
          color: rgba(155, 143, 168, 0.7);
          letter-spacing: 0.05em;
          text-align: center;
          max-width: 80px;
          line-height: 1.4;
          font-family: Georgia, serif;
        }

        /* SYNC LABEL */
        .sync-label {
          text-align: center;
          margin-top: 20px;
          padding: 0 20px;
        }

        .sync-title {
          display: block;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(212, 168, 83, 0.5);
          margin-bottom: 6px;
          font-family: Georgia, serif;
        }

        .sync-text {
          font-size: 12px;
          color: rgba(155, 143, 168, 0.6);
          line-height: 1.6;
          font-style: italic;
          font-family: Georgia, serif;
        }
      `}</style>
    </div>
  )
}

                      
