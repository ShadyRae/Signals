import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

interface Stats {
  total: number
  journalCount: number
  streak: number
  topCategory: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({ total: 0, journalCount: 0, streak: 0, topCategory: '—' })
  const [loading, setLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadStats(data.user.id)
      else setLoading(false)
    })
  }, [])

  const loadStats = async (userId: string) => {
    const { data } = await supabase
      .from('user_fortunes')
      .select('received_at, journal_entry, fortune:fortunes(category)')
      .eq('user_id', userId)
      .order('received_at', { ascending: false })

    if (data) {
      const total = data.length
      const journalCount = data.filter((e: any) => e.journal_entry).length

      // Category count
      const catCount: Record<string, number> = {}
      data.forEach((e: any) => {
        const cat = e.fortune?.category
        if (cat) catCount[cat] = (catCount[cat] || 0) + 1
      })
      const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

      // Streak calculation
      const dates = data.map((e: any) => new Date(e.received_at).toDateString())
      const uniqueDates = [...new Set(dates)]
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        if (uniqueDates.includes(d.toDateString())) streak++
        else if (i > 0) break
      }

      setStats({ total, journalCount, streak, topCategory })
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleReset = () => {
    localStorage.removeItem('signals_seen_ids')
    localStorage.removeItem('signals_queries_date')
    localStorage.removeItem('signals_queries_used')
    setShowResetConfirm(false)
    alert('Your signal pool has been reset.')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || '??'
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  const statCards = [
    { label: 'Signals Received', value: stats.total },
    { label: 'Day Streak', value: `${stats.streak} 🔥` },
    { label: 'Reflections Written', value: stats.journalCount },
    { label: 'Most Common Signal', value: stats.topCategory },
  ]

  return (
    <div className="profile-page">
      <div className="profile-content">
        {!user ? (
          <div className="profile-empty">
            <p className="empty-title">Sign in to view your profile.</p>
            <button className="action-btn" onClick={() => window.location.href = '/login'}>
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="profile-loading">
            <div className="loading-pulse" />
          </div>
        ) : (
          <>
            <div className="profile-header">
              <div className="avatar">{initials}</div>
              <p className="profile-email">{user.email}</p>
              <p className="profile-since">Member since {memberSince}</p>
            </div>

            <div className="stats-grid">
              {statCards.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="settings-section">
              <h3 className="settings-title">SETTINGS</h3>

              <div className="settings-list">
                <button
                  className="settings-item"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <span>Reset Signal Pool</span>
                  <span className="settings-arrow">→</span>
                </button>

                <button className="settings-item danger" onClick={handleSignOut}>
                  <span>Sign Out</span>
                  <span className="settings-arrow">→</span>
                </button>
              </div>
            </div>

            {showResetConfirm && (
              <div className="confirm-overlay" onClick={() => setShowResetConfirm(false)}>
                <div className="confirm-box" onClick={e => e.stopPropagation()}>
                  <p className="confirm-text">Reset your signal pool? You'll start receiving all fortunes again from the beginning.</p>
                  <div className="confirm-actions">
                    <button className="confirm-yes" onClick={handleReset}>Reset</button>
                    <button className="confirm-no" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="profile" />

      <style>{`
        .profile-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: radial-gradient(ellipse at 50% 30%, #1e0a4a 0%, #0d0820 40%, #07050f 100%);
          padding-bottom: 80px;
        }
        .profile-content { max-width: 430px; margin: 0 auto; padding: 48px 20px 20px; }
        .profile-loading, .profile-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 16px; }
        .empty-title { color: rgba(245,240,232,0.5); font-family: Georgia, serif; font-size: 16px; }
        .loading-pulse { width: 32px; height: 32px; border-radius: 50%; background: rgba(124,58,237,0.4); animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.3);opacity:1} }
        .profile-header { text-align: center; margin-bottom: 32px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(124,58,237,0.3); border: 1.5px solid rgba(212,168,83,0.4); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #d4a853; font-family: Georgia, serif; margin: 0 auto 12px; }
        .profile-email { color: rgba(245,240,232,0.8); font-family: Georgia, serif; font-size: 14px; margin: 0 0 4px; }
        .profile-since { color: rgba(155,143,168,0.5); font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.05em; margin: 0; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
        .stat-card { background: rgba(13,8,32,0.7); border: 1px solid rgba(212,168,83,0.15); border-radius: 8px; padding: 16px; text-align: center; }
        .stat-value { font-size: 22px; color: #d4a853; font-family: Georgia, serif; margin-bottom: 6px; }
        .stat-label { font-size: 10px; letter-spacing: 0.1em; color: rgba(155,143,168,0.6); font-family: Georgia, serif; text-transform: uppercase; line-height: 1.4; }
        .settings-section { margin-top: 8px; }
        .settings-title { font-size: 10px; letter-spacing: 0.25em; color: rgba(212,168,83,0.4); font-family: Georgia, serif; margin: 0 0 12px; }
        .settings-list { display: flex; flex-direction: column; gap: 2px; }
        .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: rgba(13,8,32,0.5); border: 1px solid rgba(212,168,83,0.1); border-radius: 6px; color: rgba(245,240,232,0.7); font-family: Georgia, serif; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .settings-item:hover { border-color: rgba(212,168,83,0.3); }
        .settings-item.danger { color: rgba(255,100,100,0.6); }
        .settings-arrow { color: rgba(212,168,83,0.3); font-size: 14px; }
        .action-btn { padding: 10px 24px; border: 1px solid rgba(212,168,83,0.4); background: transparent; color: #d4a853; font-family: Georgia, serif; letter-spacing: 0.1em; cursor: pointer; border-radius: 4px; font-size: 13px; }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(7,5,15,0.8); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
        .confirm-box { background: #0d0820; border: 1px solid rgba(212,168,83,0.3); border-radius: 10px; padding: 24px; max-width: 320px; width: 100%; }
        .confirm-text { color: rgba(245,240,232,0.8); font-family: Georgia, serif; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center; }
        .confirm-actions { display: flex; gap: 12px; justify-content: center; }
        .confirm-yes { padding: 10px 24px; background: rgba(212,168,83,0.15); border: 1px solid rgba(212,168,83,0.5); color: #d4a853; font-family: Georgia, serif; font-size: 13px; border-radius: 4px; cursor: pointer; }
        .confirm-no { padding: 10px 24px; background: none; border: 1px solid rgba(155,143,168,0.2); color: rgba(155,143,168,0.6); font-family: Georgia, serif; font-size: 13px; border-radius: 4px; cursor: pointer; }
      `}</style>
    </div>
  )
}
