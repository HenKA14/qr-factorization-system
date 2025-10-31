import express from 'express';
import jwt from 'jsonwebtoken';
import { computeStats } from './util.mjs'
import cors from 'cors'
import path from 'path'

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ['http://localhost:5173', 'https://qr-factorization-system.netlify.app'],
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsOptions));
// Ensure preflight requests are handled early
app.options('*', cors(corsOptions));

// JWT middleware
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
app.use((req, res, next) => {
  // Always allow CORS preflight without auth
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/health' || req.path.startsWith('/docs') || req.path === '/auth/login') return next();
  const auth = req.header('Authorization') || '';
  const [scheme, token] = auth.split(' ');
  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ error: 'missing or invalid Authorization' });
  }
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve OpenAPI JSON (absolute path compatible with Render)
app.get('/docs', (req, res) => {
  const filePath = path.join(process.cwd(), 'src', 'swagger.json');
  res.sendFile(filePath);
});

// Serve Swagger UI (simple HTML)
app.get('/docs/ui', (req, res) => {
  res.type('html').send(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Node Stats API - Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.ui = SwaggerUIBundle({ url: '/docs', dom_id: '#swagger' });
      </script>
    </body>
  </html>`);
});

// Auth login (demo)
app.post('/auth/login', (req, res) => {
  const { username = 'demo' } = req.body || {};
  const token = jwt.sign({ sub: username }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '2h' });
  res.json({ token });
});

app.post('/stats', (req, res) => {
  const { matrices } = req.body || {};
  if (!Array.isArray(matrices) || matrices.length === 0) {
    return res.status(400).json({ error: 'matrices array is required' });
  }

  // Basic validation (rectangular)
  for (const M of matrices) {
    if (!Array.isArray(M) || M.length === 0) continue;
    const cols = Array.isArray(M[0]) ? M[0].length : 0;
    for (let i = 0; i < M.length; i++) {
      if (!Array.isArray(M[i]) || M[i].length !== cols) {
        return res.status(400).json({ error: 'all matrices must be rectangular' });
      }
    }
  }

  const out = computeStats(matrices)
  if (!Number.isFinite(out.sum)) return res.status(400).json({ error: 'no numeric values found' });
  res.json(out);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`api-nodejs listening on :${port}`);
});


