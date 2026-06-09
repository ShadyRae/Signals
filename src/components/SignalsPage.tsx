import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

type QueryType = 'life' | 'month' | 'situation'

export default function SignalsPage() {
  const [queriesRemaining, setQueriesRemaining] = useState(3)
  const [drawing, setDrawing] = useState<QueryType | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date().toDateString()
    const storedDate = localStorage.getItem('signals_queries_date')
    if (storedDate === today) {
      const used = parseInt(localStorage.getItem('signals_queries_used') || '0')
      setQueriesRemaining(3 - used)
    } else {
      setQueriesRemaining(3)
    }
  }, [])

  function cryptoRandom(max: number): number {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }

  const handleQuery = async (type: QueryType) => {
    if (queriesRemaining <= 0) return
    setDrawing(type)

    try {
      const { data: allFortunes } = await supabase
        .from('fortunes')
        .select('id')
        .eq('is_active', true)

      if (!allFortunes || allFortunes.length === 0) return

      const allIds = allFortunes.map((f: any) => f.id)
      const currentSeen = JSON.parse(localStorage.getItem('signals_seen_ids') || '[]')
      const unseen = allIds.filter((id: string) => !currentSeen.includes(id))
      const pool = unseen.length > 0 ? unseen : allIds

      const selectedId = pool[cryptoRandom(pool.length)]

      const { data: fortune } = await supabase
        .from('fortunes')
        .select('*')
        .eq('id', selectedId)
        .single()

      if (fortune) {
        const newSeen = [...currentSeen, selectedId]
        localStorage.setItem('signals_seen_ids', JSON.stringify(newSeen))

        const used = parseInt(localStorage.getItem('signals_queries_used') || '0') + 1
        localStorage.setItem('signals_queries_used', String(used))
        localStorage.setItem('signals_queries_date', new Date().toDateString())
        localStorage.setItem('signals_current_fortune', JSON.stringify({ fortune, queryType: type }))

        await new Promise(r => setTimeout(r, 1800))
        navigate('/')
      }
    } catch (err) {
      console.error(err)
    }

    setDrawing(null)
  }

  const queries: { type: QueryType; title: string; sub: string; icon: React.ReactNode }[] = [
    {
      type: 'life',
      title: 'What do I most need to hear?',
      sub: 'A message for wherever you are right now.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="5" stroke="#d4a853" strokeWidth="1.5"/>
          <path d="M14 3V5M14 23V25M3 14H5M23 14H25M5.93 5.93L7.34 7.34M20.66 20.66L22.07 22.07M5.93 22.07L7.34 20.66M20.66 7.34L22.07 5.93" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      type: 'month',
      title: 'What matters most this month?',
      sub: 'A signal for the season ahead.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M20 10C20 18 14 22 8 20C12 26 22 24 24 16C26 10 22 4 20 10Z" fill="#d4a853" opacity="0.8"/>
        </svg>
      ),
    },
    {
      type: 'situation',
      title: 'I need direction on something.',
      sub: 'Bring a specific situation to mind before tapping.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" stroke="#d4a853" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="3" fill="#d4a853"/>
          <path d="M14 4V8M14 20V24M4 14H8M20 14H24" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="signals-page">
      <div className="signals-content">
        <div className="signals-header">
          <h1 className="signals-title">Send a Signal</h1>
          <p className="signals-sub">ASK WITH INTENTION. RECEIVE WITH TRUST.</p>
          <div className="queries-remaining">
            {queriesRemaining > 0
              ? `${queriesRemaining} of 3 signals remaining today`
              : 'Your signals reset at midnight'}
          </div>
        </div>

        <div className="query-cards">
          {queries.map(q => (
            <button
              key={q.type}
              className={`query-card ${queriesRemaining <= 0 ? 'locked' : ''} ${drawing === q.type ? 'receiving' : ''}`}
              onClick={() => handleQuery(q.type)}
              disabled={queriesRemaining <= 0 || drawing !== null}
            >
              <div className="query-icon">
                {drawing === q.type ? (
                  <div className="receiving-pulse" />
                ) : (
                  q.icon
                )}
              </div>
              <div className="query-text">
                <h3 className="query-title">{q.title}</h3>
                <p className="query-sub">
                  {drawing === q.type ? 'receiving...' : q.sub}
                </p>
              </div>
              {queriesRemaining <= 0 && (
                <div className="lock-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="8" rx="2" stroke="rgba(155,143,168,0.4)" strokeWidth="1.5"/>
                    <path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="rgba(155,143,168,0.4)" strokeWidth="1.5"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {queriesRemaining <= 0 && (
          <p className="reset-note">Come back tomorrow. The signals reset at midnight.</p>
        )}
      </div>

      <BottomNav active="signals" />

      <style>{`
        .signals-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: radial-gradient(ellipse at 50% 30%, #1e0a4a 0%, #0d0820 40%, #07050f 100%);
          padding-bottom: 80px;
        }
        .signals-content {
          max-width: 430px;
          margin: 0 auto;
          padding: 48px 20px 20px;
        }
        .signals-header { text-align: center; margin-bottom: 36px; }
        .signals-title { font-size: 32px; font-weight: normal; color: #f5f0e8; font-family: Georgia, serif; margin: 0 0 8px; }
        .signals-sub { font-size: 10px; letter-spacing: 0.25em; color: rgba(212,168,83,0.5); font-family: Georgia, serif; margin: 0 0 16px; }
        .queries-remaining { font-size: 12px; color: rgba(155,143,168,0.6); font-family: Georgia, serif; font-style: italic; }
        .query-cards { display: flex; flex-direction: column; gap: 14px; }
        .query-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(13,8,32,0.7);
          border: 1px solid rgba(212,168,83,0.2);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          position: relative;
          box-shadow: 0 0 20px rgba(124,58,237,0.05);
        }
        .query-card:hover:not(.locked) { border-color: rgba(212,168,83,0.4); box-shadow: 0 0 30px rgba(124,58,237,0.15); }
        .query-card:active:not(.locked) { transform: scale(0.98); }
        .query-card.locked { opacity: 0.4; cursor: not-allowed; }
        .query-card.receiving { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 40px rgba(124,58,237,0.25); }
        .query-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .receiving-pulse { width: 28px; height: 28px; border-radius: 50%; background: rgba(124,58,237,0.4); animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.4);opacity:1} }
        .query-text { flex: 1; }
        .query-title { font-size: 15px; font-weight: normal; color: #f5f0e8; font-family: Georgia, serif; margin: 0 0 5px; line-height: 1.4; }
        .query-sub { font-size: 12px; color: rgba(155,143,168,0.6); font-family: Georgia, serif; font-style: italic; margin: 0; line-height: 1.4; }
        .lock-icon { position: absolute; top: 16px; right: 16px; }
        .reset-note { text-align: center; margin-top: 24px; font-size: 12px; color: rgba(155,143,168,0.4); font-family: Georgia, serif; font-style: italic; }
      `}</style>
    </div>
  )
}
