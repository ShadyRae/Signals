import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FortunePage from './components/FortunePage'
import JournalPage from './components/JournalPage'
import SignalsPage from './components/SignalsPage'
import ProfilePage from './components/ProfilePage'
import LoginPage from './components/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FortunePage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/signals" element={<SignalsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div style={{color:'#d4a853',background:'#07050f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Georgia,serif',fontSize:'1.2rem',letterSpacing:'0.1em'}}>SIGNALS — ADMIN (Layer 4)</div>} />
      </Routes>
    </BrowserRouter>
  )
}
