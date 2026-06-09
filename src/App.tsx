import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FortunePage from './components/FortunePage'
import BottomNav from './components/BottomNav'

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
      letterSpacing: '0.1em',
      paddingBottom: '72px',
    }}>
      SIGNALS — {name}
      <BottomNav active={name.toLowerCase() as any} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FortunePage />} />
        <Route path="/journal" element={<PlaceholderPage name="JOURNAL" />} />
        <Route path="/signals" element={<PlaceholderPage name="SIGNALS" />} />
        <Route path="/profile" element={<PlaceholderPage name="PROFILE" />} />
        <Route path="/admin" element={<PlaceholderPage name="ADMIN" />} />
        <Route path="/login" element={<PlaceholderPage name="LOGIN" />} />
      </Routes>
    </BrowserRouter>
  )
}
