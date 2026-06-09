import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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
  const [fortune, setFortune] = useState<any>(null)
  const [drawState, setDrawState] = useState<DrawState>('idle')
  const [queriesRemaining, setQueriesRemaining] = useState(3)
  const [isDaily, setIsDaily] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem('signals_queries_date')
    if (storedDate === today) {
      const used = parseInt(localStorage.getItem('signals_queries_used') || '0')
      setQueriesRemaining(3 - used)
    } else {
      localStorage.setItem('signals_queries_date', today)
      localStorage.setItem('signals_queries_used', '0')
      setQueriesRemaining(3)
    }
    drawDaily()
  }, [])

  const drawDaily = async () => {
    const todayKey = `signals_daily_${new Date().toDateString()}`
    const storedDailyId = localStorage.getItem(todayKey)

    if (storedDailyId) {
      const { data, error } = await supabase
        .from('fortunes')
        .select('*')
        .eq('id', storedDailyId)
        .single()
      if (data && !error) {
        setFortune(data)
        setDrawState('revealed')
        setIsDaily(true)
        return
      }
    }

    await drawFortune(true)
  }

  const drawFortune = async (daily = false) => {
    setDrawState('drawing')
    setFortune(null)

    try {
      const { data, error } = await supabase
        .from('fortunes')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Supabase error:', error)
        setDrawState('idle')
        return
      }

      if (!data || data.length === 0) {
        console.error('No fortunes found')
        setDrawState('idle')
        return
      }

      const seen = JSON.parse(localStorage.getItem('signals_seen_ids') || '[]')
      const unseen = data.filter((f: any) => !seen.includes(f.id))
      const pool = unseen.length > 0 ? unseen : data

      const selected = pool[cryptoRandom(pool.length)]

      const newSeen = [...seen, selected.id]
      localStorage.setItem('signals_seen_ids', JSON.stringify(newSeen))

      if (daily) {
        const todayKey = `signals_daily_${new Date().toDateString()}`
        localStorage.setItem(todayKey, selected.id)
        setIsDaily(true)
      } else {
        setIsDaily(false)
        const used = parseInt(localStorage.getItem('signals_queries_used') || '0') + 1
        localStorage.setItem('signals_queries_used', String(used))
        setQueriesRemaining(3 - used)
      }

      await new Promise(r => setTimeout(r, 1500))
      setFortune(selected)
      setDrawState('revealed')

    } catch (err) {
      console.error('Draw error:', err)
      setDrawState('idle')
    }
  }

  return (
    <div className="signals-app">
      <StarField />
      <div className="signals-content">
        <div className="arch-header">
          <div className="arch-moon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L24 4 M24 44 L24 40 M8 24 L4 24 M44 24 L40 24" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M30 18 C30 26 24 32 16 30 C20 38 32 36 36 28 C38 22 35 14 30 18Z" fill="#d4a853" opacity="0.9"/>
            </svg>
          </div>
          <p className="arch-label">MEANT FOR YOU</p>
          <h1 className="arch-title">Your Fortune</h1>
          <p className="arch-subtitle">TRUST THE MOMENT</p>
        </div>

        <div className="card-area">
          <FortuneCard fortune={fortune} drawState={drawState} isDaily={isDaily} />
        </div>

        <CrystalBall drawState={drawState} />

        <div className="action-buttons">
          <button
            className={`action-btn ${queriesRemaining <= 0 || drawState === 'drawing' ? 'disabled' : ''}`}
            onClick={() => drawFortune(false)}
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
            {queriesRemaining > 0 ? `${queriesRemaining} of 3 remaining` : 'Come back tomorrow'}
          </div>

          <button
            className={`action-btn ${drawState === 'drawing' ? 'disabled' : ''}`}
            onClick={drawDaily}
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

        <div className="sync-label">
          <span className="sync-title">SYNCHRONICITY</span>
          <p className="sync-text">This fortune is randomly generated in this exact moment for you.</p>
        </div>
      </div>

      <BottomNav active="fortune" />

      <style>{`
        .signals-app { min-height:100vh; min-height:100dvh; background:radial-gradient(ellipse at 50% 30%,#1e0a4a 0%,#0d0820 40%,#07050f 100%); position:relative; overflow:hidden; display:flex; flex-direction:column; }
        .signals-content { flex:1; display:flex; flex-direction:column; align-items:center; padding:0 20px 100px; position:relative; z-index:10; max-width:430px; margin:0 auto; width:100%; }
        .arch-header { text-align:center; padding-top:48px; padding-bottom:16px; }
        .arch-moon { display:flex; justify-content:center; margin-bottom:8px; }
        .arch-label { font-size:10px; letter-spacing:0.25em; color:rgba(212,168,83,0.5); font-family:Georgia,serif; margin-bottom:6px; }
        .arch-title { font-size:36px; font-weight:normal; color:#f5f0e8; font-family:Georgia,serif; margin-bottom:6px; text-shadow:0 0 40px rgba(124,58,237,0.4); }
        .arch-subtitle { font-size:10px; letter-spacing:0.25em; color:rgba(212,168,83,0.5); font-family:Georgia,serif; }
        .card-area { width:100%; min-height:320px; display:flex; align-items:center; justify-content:center; margin:8px 0; }
        .action-buttons { display:flex; align-items:center; gap:16px; margin-top:-10px; position:relative; z-index:20; }
        .action-btn { display:flex; flex-direction:column; align-items:center; gap:8px; background:none; border:none; cursor:pointer; padding:0; }
        .action-btn.disabled { opacity:0.35; cursor:not-allowed; }
        .action-btn-icon { width:52px; height:52px; border-radius:50%; border:1.5px solid rgba(212,168,83,0.6); background:rgba(7,5,15,0.8); display:flex; align-items:center; justify-content:center; }
        .action-btn-label { font-size:9px; letter-spacing:0.15em; color:rgba(212,168,83,0.7); font-family:Georgia,serif; text-align:center; line-height:1.4; }
        .queries-counter { font-size:10px; color:rgba(155,143,168,0.7); letter-spacing:0.05em; text-align:center; max-width:80px; line-height:1.4; font-family:Georgia,serif; }
        .sync-label { text-align:center; margin-top:20px; padding:0 20px; }
        .sync-title { display:block; font-size:10px; letter-spacing:0.25em; color:rgba(212,168,83,0.5); margin-bottom:6px; font-family:Georgia,serif; }
        .sync-text { font-size:12px; color:rgba(155,143,168,0.6); line-height:1.6; font-style:italic; font-family:Georgia,serif; }
      `}</style>
    </div>
  )
}
