export function computeStats(matrices) {
  const values = []
  let anyDiagonal = false
  for (const M of matrices) {
    if (!Array.isArray(M) || M.length === 0) continue
    const rows = M.length
    const cols = Array.isArray(M[0]) ? M[0].length : 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        values.push(Number(M[i][j]))
      }
    }
    if (rows === cols) {
      let diagonal = true
      for (let i = 0; i < rows && diagonal; i++) {
        for (let j = 0; j < cols; j++) {
          if (i !== j && M[i][j] !== 0) { diagonal = false; break }
        }
      }
      if (diagonal) anyDiagonal = true
    }
  }
  let min = Infinity, max = -Infinity, sum = 0
  for (const v of values) { if (v < min) min = v; if (v > max) max = v; sum += v }
  const average = values.length ? sum / values.length : 0
  return { max, min, sum, average, anyDiagonal }
}


