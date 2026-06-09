import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [magicLink, setMagicLink] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (magicLink) {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) setMessage(error.message)
        else setMessage('Check your email for a sign-in link.')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMessage(error.message)
        else setMessage('Account created! Check your email to confirm.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMessage(error.message)
      }
    } catch {
      setMessage('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L17.8 13.2L29 16L17.8 18.8L16 30L14.2 18.8L3 16L14.2 13.2Z" fill="#d4a853"/>
          </svg>
        </div>
        <h1 className="login-title">Signals</h1>
        <p className="login-tagline">Trust the moment.</p>

        <div className="login-form">
          {!magicLink && (
            <div className="mode-toggle">
              <button
                className={mode === 'signin' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('signin')}
              >Sign In</button>
              <button
                className={mode === 'signup' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setMode('signup')}
              >Create Account</button>
            </div>
          )}

          <input
            className="login-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {!magicLink && (
            <input
              className="login-input"
              type="password"
              placeholder="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}

          <button
            className="login-btn"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? 'one moment...' : magicLink ? 'Send Sign-In Link' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          {message && <p className="login-message">{message}</p>}

          <button
            className="magic-link-toggle"
            onClick={() => { setMagicLink(!magicLink); setMessage('') }}
          >
            {magicLink ? '← Use password instead' : 'Send me a sign-in link instead'}
          </button>
        </div>

        <button className="guest-btn" onClick={() => window.location.href = '/'}>
          Just browsing? Draw a free fortune →
        </button>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: radial-gradient(ellipse at 50% 30%, #1e0a4a 0%, #0d0820 40%, #07050f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-content {
          width: 100%;
          max-width: 360px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .login-logo { animation: spinSlow 20s linear infinite; }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .login-title {
          font-size: 42px;
          font-weight: normal;
          color: #f5f0e8;
          font-family: Georgia, serif;
          letter-spacing: 0.05em;
          text-shadow: 0 0 40px rgba(124,58,237,0.4);
          margin: 0;
        }
        .login-tagline {
          font-size: 11px;
          letter-spacing: 0.25em;
          color: rgba(212,168,83,0.6);
          font-family: Georgia, serif;
          margin: 0;
        }
        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .mode-toggle {
          display: flex;
          border: 1px solid rgba(212,168,83,0.3);
          border-radius: 6px;
          overflow: hidden;
        }
        .mode-btn {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: none;
          color: rgba(155,143,168,0.7);
          font-family: Georgia, serif;
          font-size: 13px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: rgba(212,168,83,0.15);
          color: #d4a853;
        }
        .login-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(13,8,32,0.8);
          border: 1px solid rgba(212,168,83,0.2);
          border-radius: 6px;
          color: #f5f0e8;
          font-family: Georgia, serif;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .login-input:focus { border-color: rgba(212,168,83,0.5); }
        .login-input::placeholder { color: rgba(155,143,168,0.4); }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: rgba(212,168,83,0.15);
          border: 1px solid rgba(212,168,83,0.5);
          border-radius: 6px;
          color: #d4a853;
          font-family: Georgia, serif;
          font-size: 14px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .login-btn:hover { background: rgba(212,168,83,0.25); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-message {
          font-size: 12px;
          color: rgba(167,139,250,0.8);
          font-family: Georgia, serif;
          font-style: italic;
          text-align: center;
        }
        .magic-link-toggle {
          background: none;
          border: none;
          color: rgba(155,143,168,0.6);
          font-family: Georgia, serif;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          padding: 4px;
        }
        .guest-btn {
          background: none;
          border: none;
          color: rgba(212,168,83,0.5);
          font-family: Georgia, serif;
          font-size: 12px;
          cursor: pointer;
          letter-spacing: 0.05em;
          margin-top: 8px;
          padding: 8px;
        }
      `}</style>
    </div>
  )
}
