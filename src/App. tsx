import { BrowserRouter, Routes, Route } from 'react-router-dom'

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#07050f',
      color: '#d4a853',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      fontSize: '1.5rem',
      letterSpacing: '0.1em'
    }}>
      SIGNALS — {name}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderPage name="FORTUNE" />} />
        <Route path="/journal" element={<PlaceholderPage name="JOURNAL" />} />
        <Route path="/signals" element={<PlaceholderPage name="SIGNALS" />} />
        <Route path="/profile" element={<PlaceholderPage name="PROFILE" />} />
        <Route path="/admin" element={<PlaceholderPage name="ADMIN" />} />
        <Route path="/login" element={<PlaceholderPage name="LOGIN" />} />
      </Routes>
    </BrowserRouter>
  )
}
