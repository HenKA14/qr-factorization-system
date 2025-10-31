import React, { useState, useMemo } from 'react'

const API_NODE = import.meta.env.VITE_API_NODE || 'http://localhost:3000'

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const freeImage = useMemo(() => {
    const images = [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1680&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1680&auto=format&fit=crop',
    ]
    return images[Math.floor(Math.random() * images.length)]
  }, [])

  const login = async () => {
    setLoading(true)
    setError('')
    try {
      const url = new URL('/auth/login', API_NODE).toString()
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const token = json?.token
      if (!token) throw new Error('Token no recibido')
      onLoggedIn(token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
      <div style={{ width: 'min(980px, 92vw)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', background: '#fff', display: 'grid', gridTemplateColumns: '1fr 1.1fr' }}>
        {/* Form left */}
        <div style={{ padding: '32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 900, letterSpacing: 0.5 }}>QR System</div>
            <span style={{ fontSize: 12, color: '#666' }}>Demo: admin / admin</span>
          </div>
          <div style={{ marginTop: 22 }}>
            <h2 style={{ margin: 0, fontSize: 28 }}>Inicia sesión</h2>
            <p style={{ color: '#666', marginTop: 6 }}>Autentícate para calcular la factorización QR</p>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <label style={{ display: 'grid', gap: 6 }}>Usuario
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                style={{ padding: '12px 14px', border: '2px solid #e6e6e6', borderRadius: 10 }}
                onKeyDown={e => { if (e.key === 'Enter') login() }}
              />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Contraseña
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="admin"
                style={{ padding: '12px 14px', border: '2px solid #e6e6e6', borderRadius: 10 }}
                onKeyDown={e => { if (e.key === 'Enter') login() }}
              />
            </label>
            <button onClick={login} disabled={loading} style={{ background: '#111', color: '#fff', borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
            {error && <div style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: 10 }}>Error: {error}</div>}
          </div>
        </div>
        {/* Image right */}
        <div style={{ position: 'relative', minHeight: 420, background: '#111' }}>
          <img src={freeImage} alt="login visual" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.05)' }} />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 38, height: 38, background: 'rgba(255,255,255,0.92)', borderRadius: 12, display: 'grid', placeItems: 'center', fontWeight: 900, color: '#111' }}>QR</div>
        </div>
      </div>
    </div>
  )
}

