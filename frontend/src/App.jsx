import React, { useMemo, useState } from 'react'
import Login from './components/Login.jsx'

const API = import.meta.env.VITE_API_GO || 'http://localhost:8080'
const API_NODE = import.meta.env.VITE_API_NODE || 'http://localhost:3000'

export default function App() {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(2)
  const [matrix, setMatrix] = useState(() => Array.from({ length: 3 }, (_, i) => Array.from({ length: 2 }, (_, j) => i * 2 + j + 1)))
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const grid = useMemo(() => {
    const r = Math.max(1, rows)
    const c = Math.max(1, cols)
    const m = Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => (matrix[i]?.[j] ?? 0)))
    return m
  }, [rows, cols, matrix])

  const onChangeCell = (i, j, v) => {
    const num = Number(v)
    setMatrix(prev => {
      const next = prev.map(row => row.slice())
      if (!next[i]) next[i] = []
      next[i][j] = Number.isNaN(num) ? 0 : num
      return next
    })
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ matrix: grid }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setResult(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoggedIn = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem('token')
  }

  if (!token) return <Login onLoggedIn={handleLoggedIn} />

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>QR Factorization</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'green' }}>Autenticado</span>
          <button onClick={logout}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <label>Rows
          <input type="number" value={rows} min={1} onChange={e => setRows(Number(e.target.value))} style={{ marginLeft: 8 }} />
        </label>
        <label>Cols
          <input type="number" value={cols} min={1} onChange={e => setCols(Number(e.target.value))} style={{ marginLeft: 8 }} />
        </label>
        <button onClick={submit} disabled={loading}>Calcular QR</button>
      </div>

      <div style={{ marginTop: 16, overflowX: 'auto' }}>
        <table border="1" cellPadding="6">
          <tbody>
            {grid.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td key={j}>
                    <input type="number" value={val} onChange={e => onChangeCell(i, j, e.target.value)} style={{ width: 80 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div style={{ color: 'red', marginTop: 12 }}>Error: {error}</div>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Resultado</h2>
          <pre style={{ background: '#f5f5f5', padding: 12 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}


