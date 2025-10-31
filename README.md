## QR Factorization System

Dos APIs que cooperan:
- API en Go (Fiber): recibe una matriz, calcula la factorización QR y opcionalmente llama a la API Node para estadísticas sobre `Q` y `R`.
- API en Node.js (Express): recibe matrices y devuelve estadísticas (máximo, mínimo, promedio, suma, y si alguna matriz es diagonal).

### Requisitos
- Docker y Docker Compose

### Ejecución
```bash
docker compose up --build
```

Servicios:
- api-go: `http://localhost:8080`
- api-nodejs: `http://localhost:3000`

### Variables de entorno
- api-go: `NODE_API_URL` (por defecto `http://api-nodejs:3000` en docker-compose), `PORT` (8080 por defecto)
- api-nodejs: `PORT` (3000 por defecto)

### Endpoints
#### API Go (Fiber)
- GET `/health`
- POST `/qr`
  - Request JSON:
    ```json
    {
      "matrix": [[1,2,3],[4,5,6],[7,8,9]]
    }
    ```
  - Response JSON:
    ```json
    {
      "Q": [[...],[...],...],
      "R": [[...],[...],...],
      "stats": { "max": 1.23, "min": -4.5, "average": 0.12, "sum": 3.45, "anyDiagonal": false }
    }
    ```
  - Nota: `stats` aparece si `NODE_API_URL` está configurado.

#### API Node (Express)
- GET `/health`
- POST `/stats`
  - Request JSON:
    ```json
    {
      "matrices": [
        [[1,0,0],[0,2,0],[0,0,3]],
        [[10,11],[12,13]]
      ]
    }
    ```
  - Response JSON:
    ```json
    {
      "max": 13,
      "min": 0,
      "average": 4.6666666667,
      "sum": 42,
      "anyDiagonal": true
    }
    ```

### Arquitectura
- La API Go implementa factorización QR usando Gram-Schmidt clásico para matrices rectangulares (m×n, m≥n). Devuelve `Q` (m×n) y `R` (n×n).
- Si `NODE_API_URL` está definido, la API Go envía `Q` y `R` a la API Node en `/stats` y adjunta la respuesta como `stats`.

### Pruebas rápidas con curl
```bash
curl -s http://localhost:8080/health

curl -s -X POST http://localhost:8080/qr \
  -H 'Content-Type: application/json' \
  -d '{"matrix": [[1,2],[3,4],[5,6]]}' | jq

curl -s -X POST http://localhost:3000/stats \
  -H 'Content-Type: application/json' \
  -d '{"matrices": [[[1,0],[0,2]], [[3,4],[5,6]]]}' | jq
```

### Notas
- Se prioriza claridad y simplicidad del algoritmo QR para propósitos del challenge.
- Extensiones opcionales: JWT, frontend, pruebas unitarias/integración.


