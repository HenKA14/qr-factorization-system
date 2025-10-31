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
      const normalized = {
        q: json.q || json.Q || json.q_matrix || json.QMatrix || null,
        r: json.r || json.R || json.r_matrix || json.RMatrix || null,
        success: typeof json.success === 'boolean' ? json.success : true,
        stats: json.stats || json.statistics || null,
      }
      setResult(normalized)
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
    <div style={{ minHeight: '100vh', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>QR Factorization</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: 999, fontSize: 12 }}>Autenticado</span>
            <button onClick={logout} style={{ padding: '8px 12px', borderRadius: 8 }}>Salir</button>
          </div>
        </div>

        {/* Card principal */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: 20 }}>
          <p style={{ color: '#666', marginTop: 0 }}>Define dimensiones y valores de la matriz. Presiona "Calcular QR" para obtener Q y R.</p>

          {/* Controles */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <label>Filas
              <input type="number" value={rows} min={1} onChange={e => setRows(Number(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
            </label>
            <label>Columnas
              <input type="number" value={cols} min={1} onChange={e => setCols(Number(e.target.value))} style={{ marginLeft: 8, width: 80 }} />
            </label>
            <button onClick={submit} disabled={loading} style={{ background: '#111', color: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>
              {loading ? 'Calculando…' : 'Calcular QR'}
            </button>
          </div>

          {/* Tabla de edición */}
          <div style={{ marginTop: 16, overflowX: 'auto', border: '1px solid #eee', borderRadius: 10 }}>
            <table cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {grid.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td key={j} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <input type="number" value={val} onChange={e => onChangeCell(i, j, e.target.value)} style={{ width: 90 }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <div style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 10, padding: 10, marginTop: 12 }}>Error: {error}</div>}

          {/* Resultados */}
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Resultados</h2>
            {!result && <div style={{ color: '#666' }}>Aún no hay resultados. Ingresa una matriz y calcula.</div>}
            {result && (
              <div>
                {/* Resumen */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ background: '#eef2ff', color: '#3730a3', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>Q: {result.q?.length ?? 0}×{result.q?.[0]?.length ?? 0}</span>
                  <span style={{ background: '#eef2ff', color: '#3730a3', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>R: {result.r?.length ?? 0}×{result.r?.[0]?.length ?? 0}</span>
                  <span style={{ background: result.success ? '#dcfce7' : '#fee2e2', color: result.success ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>Estado: {result.success ? 'OK' : 'Error'}</span>
                  {result.stats && (
                    <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>Valores: {result.stats.min?.toFixed?.(3)} → {result.stats.max?.toFixed?.(3)}</span>
                  )}
                </div>

                {/* Q y R en tarjetas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                    <h3 style={{ marginTop: 0 }}>Matriz Q</h3>
                    <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', background: '#f8fafc', borderRadius: 8, padding: 12, maxHeight: 280, overflow: 'auto' }}>{formatMatrix(result.q)}</pre>
                  </div>
                  <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
                    <h3 style={{ marginTop: 0 }}>Matriz R</h3>
                    <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', background: '#f8fafc', borderRadius: 8, padding: 12, maxHeight: 280, overflow: 'auto' }}>{formatMatrix(result.r)}</pre>
                  </div>
                </div>

                {/* Stats si existen */}
                {result.stats && (
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 }}>
                    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Máximo</div>
                      <div style={{ fontWeight: 700 }}>{Number(result.stats.max).toFixed(6)}</div>
                    </div>
                    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Mínimo</div>
                      <div style={{ fontWeight: 700 }}>{Number(result.stats.min).toFixed(6)}</div>
                    </div>
                    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Promedio</div>
                      <div style={{ fontWeight: 700 }}>{Number(result.stats.average).toFixed(6)}</div>
                    </div>
                    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Suma</div>
                      <div style={{ fontWeight: 700 }}>{Number(result.stats.sum).toFixed(6)}</div>
                    </div>
                    {'anyDiagonal' in result.stats && (
                      <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>¿Alguna diagonal?</div>
                        <div style={{ fontWeight: 700 }}>{result.stats.anyDiagonal ? 'Sí' : 'No'}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatMatrix(matrix) {
  if (!Array.isArray(matrix)) return '—'
  return matrix.map(row => row.map(v => {
    const num = Number(v)
    return Number.isFinite(num) ? num.toFixed(6).padStart(10, ' ') : String(v)
  }).join('  ')).join('\n')
}


