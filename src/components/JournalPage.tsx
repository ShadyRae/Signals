import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import BottomNav from './BottomNav'

type Category = 'all' | 'advice' | 'warning' | 'reminder' | 'synchronicity' | 'relationship' | 'decision' | 'shadow' | 'abundance'

interface JournalEntry {
  id: string
  fortune_id: string
  received_at: string
  query_type: string
  journal_entry: string | null
  saved: boolean
  fortune: {
    title: string
    body: string
    category: string
    highlight_word: string
  }
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Category>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadEntries(data.user.id)
      else setLoading(false)
    })
  }, [])

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from('user_fortunes')
      .select(`
        id, fortune_id, received_at, query_type, journal_entry, saved,
        fortune:fortunes(title, body, category, highlight_word)
      `)
      .eq('user_id', userId)
      .order('received_at', { ascending: false })

    if (data) setEntries(data as any)
    setLoading(false)
  }

  const saveEdit = async (id: string) => {
    await supabase
      .from('user_fortunes')
      .update({ journal_entry: editText, saved: true })
      .eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, journal_entry: editText, saved: true } : e))
    setEditing(null)
  }

  const deleteEntry = async (id: string) => {
    await supabase.from('user_fortunes').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const queryLabel: Record<string, string> = {
    daily: 'Daily Signal',
    life: 'Life Signal',
    month: 'Month Signal',
    situation: 'Situation Signal',
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.fortune?.category === filter)
  const categories: Category[] = ['all', 'advice', 'warning', 'reminder', 'synchronicity', 'relationship', 'decision', 'shadow', 'abundance']

  return (
    <div className="journal-page">
      <div className="journal-content">
        <div className="journal-header">
          <h1 className="journal-title">Your Signals</h1>
          <p className="journal-sub">MESSAGES YOU'VE RECEIVED</p>
        </div>

        {!user ? (
          <div className="journal-empty">
            <p className="empty-title">Sign in to save your signals.</p>
            <button className="signin-btn" onClick={() => window.location.href = '/login'}>
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="journal-loading">
            <div className="loading-pulse" />
          </div>
        ) : (
          <>
            <div className="filter-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="journal-empty">
                <p className="empty-title">No signals here yet.</p>
                <button className="signin-btn" onClick={() => window.location.href = '/'}>
                  Draw a fortune →
                </button>
              </div>
            ) : (
              <div className="entries-list">
                {filtered.map(entry => (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-header" onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                      <div className="entry-meta">
                        <span className="entry-category">{entry.fortune?.category}</span>
                        <span className="entry-type">{queryLabel[entry.query_type] || entry.query_type}</span>
                      </div>
                      <h3 className="entry-title">{entry.fortune?.title}</h3>
                      <div className="entry-footer-row">
                        <span className="entry-date">
                          {new Date(entry.received_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="expand-icon">{expanded === entry.id ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expanded === entry.id && (
                      <div className="entry-expanded">
                        <p className="entry-body">{entry.fortune?.body}</p>

                        {editing === entry.id ? (
                          <div className="edit-area">
                            <textarea
                              className="journal-textarea"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              placeholder="Write your reflection..."
                              rows={4}
                            />
                            <div className="edit-actions">
                              <button className="save-btn" onClick={() => saveEdit(entry.id)}>Save</button>
                              <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="journal-note">
                            {entry.journal_entry ? (
                              <p className="note-text">"{entry.journal_entry}"</p>
                            ) : (
                              <p className="note-empty">No reflection written yet.</p>
                            )}
                            <div className="note-actions">
                              <button className="edit-btn" onClick={() => { setEditing(entry.id); setEditText(entry.journal_entry || '') }}>
                                {entry.journal_entry ? 'Edit' : '+ Add Reflection'}
                              </button>
                              <button className="delete-btn" onClick={() => deleteEntry(entry.id)}>Remove</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="journal" />

      <style>{`
        .journal-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: radial-gradient(ellipse at 50% 30%, #1e0a4a 0%, #0d0820 40%, #07050f 100%);
          padding-bottom: 80px;
        }
        .journal-content {
          max-width: 430px;
          margin: 0 auto;
          padding: 48px 20px 20px;
        }
        .journal-header { text-align: center; margin-bottom: 24px; }
        .journal-title { font-size: 32px; font-weight: normal; color: #f5f0e8; font-family: Georgia, serif; margin: 0 0 6px; }
        .journal-sub { font-size: 10px; letter-spacing: 0.25em; color: rgba(212,168,83,0.5); font-family: Georgia, serif; }
        .filter-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 20px; scrollbar-width: none; }
        .filter-bar::-webkit-scrollbar { display: none; }
        .filter-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(212,168,83,0.25); background: transparent; color: rgba(155,143,168,0.7); font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.05em; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .filter-pill.active { background: rgba(212,168,83,0.15); border-color: rgba(212,168,83,0.6); color: #d4a853; }
        .journal-loading { display: flex; justify-content: center; padding: 60px; }
        .loading-pulse { width: 32px; height: 32px; border-radius: 50%; background: rgba(124,58,237,0.4); animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.3);opacity:1} }
        .journal-empty { text-align: center; padding: 60px 20px; }
        .empty-title { color: rgba(245,240,232,0.5); font-family: Georgia, serif; font-size: 16px; margin-bottom: 16px; }
        .signin-btn { padding: 10px 24px; border: 1px solid rgba(212,168,83,0.4); background: transparent; color: #d4a853; font-family: Georgia, serif; letter-spacing: 0.1em; cursor: pointer; border-radius: 4px; font-size: 13px; }
        .entries-list { display: flex; flex-direction: column; gap: 12px; }
        .entry-card { border: 1px solid rgba(212,168,83,0.2); border-radius: 8px; background: rgba(13,8,32,0.7); overflow: hidden; }
        .entry-header { padding: 16px; cursor: pointer; }
        .entry-meta { display: flex; gap: 8px; margin-bottom: 8px; }
        .entry-category { font-size: 9px; letter-spacing: 0.15em; color: rgba(167,139,250,0.7); font-family: Georgia, serif; text-transform: uppercase; padding: 3px 8px; border: 1px solid rgba(167,139,250,0.2); border-radius: 10px; }
        .entry-type { font-size: 9px; letter-spacing: 0.1em; color: rgba(212,168,83,0.5); font-family: Georgia, serif; padding: 3px 8px; }
        .entry-title { font-size: 16px; font-weight: normal; color: #f5f0e8; font-family: Georgia, serif; margin: 0 0 8px; }
        .entry-footer-row { display: flex; justify-content: space-between; align-items: center; }
        .entry-date { font-size: 11px; color: rgba(155,143,168,0.5); font-family: Georgia, serif; }
        .expand-icon { font-size: 10px; color: rgba(212,168,83,0.4); }
        .entry-expanded { padding: 0 16px 16px; border-top: 1px solid rgba(212,168,83,0.1); }
        .entry-body { font-size: 13px; line-height: 1.7; color: rgba(245,240,232,0.7); font-family: Georgia, serif; margin: 16px 0; }
        .journal-note { margin-top: 12px; }
        .note-text { font-size: 13px; color: rgba(167,139,250,0.8); font-family: Georgia, serif; font-style: italic; line-height: 1.6; margin-bottom: 12px; }
        .note-empty { font-size: 12px; color: rgba(155,143,168,0.4); font-family: Georgia, serif; font-style: italic; margin-bottom: 12px; }
        .note-actions { display: flex; gap: 12px; }
        .edit-btn { background: none; border: 1px solid rgba(212,168,83,0.3); color: rgba(212,168,83,0.7); font-family: Georgia, serif; font-size: 11px; padding: 6px 14px; border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; }
        .delete-btn { background: none; border: none; color: rgba(155,143,168,0.4); font-family: Georgia, serif; font-size: 11px; cursor: pointer; padding: 6px; }
        .edit-area { margin-top: 12px; }
        .journal-textarea { width: 100%; background: rgba(7,5,15,0.8); border: 1px solid rgba(212,168,83,0.2); border-radius: 6px; color: #f5f0e8; font-family: Georgia, serif; font-size: 13px; padding: 12px; resize: none; outline: none; box-sizing: border-box; line-height: 1.6; }
        .edit-actions { display: flex; gap: 10px; margin-top: 8px; }
        .save-btn { padding: 8px 20px; background: rgba(212,168,83,0.15); border: 1px solid rgba(212,168,83,0.5); color: #d4a853; font-family: Georgia, serif; font-size: 12px; border-radius: 4px; cursor: pointer; letter-spacing: 0.05em; }
        .cancel-btn { padding: 8px 16px; background: none; border: none; color: rgba(155,143,168,0.5); font-family: Georgia, serif; font-size: 12px; cursor: pointer; }
      `}</style>
    </div>
  )
}
