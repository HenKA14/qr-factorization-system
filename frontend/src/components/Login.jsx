import React, { useState } from 'react'

const API_NODE = import.meta.env.VITE_API_NODE || 'http://localhost:3000'

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const { token } = await res.json()
      onLoggedIn(token)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Iniciar sesión</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 4 }}>Usuario
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>Clave
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button onClick={login} disabled={loading}>{loading ? 'Ingresando...' : 'Login'}</button>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </div>
      </div>
    </div>
  )
}


