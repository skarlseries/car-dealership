require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

require('./db/database');
const seed = require('./db/seed');

const authRoutes = require('./routes/auth');
const carsRoutes = require('./routes/cars');
const testDriveRoutes = require('./routes/testDrive');
const adminRoutes = require('./routes/admin');

seed();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoPremium API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/test-drive', testDriveRoutes);
app.use('/api/admin', adminRoutes);

const staticRoot = path.join(__dirname, '../..');
app.use(express.static(staticRoot));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Эндпоинт не найден' });
  }
  res.sendFile(path.join(staticRoot, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`AutoPremium API: http://localhost:${PORT}`);
  console.log(`Frontend:       http://localhost:${PORT}/index.html`);
  console.log(`Health check:   http://localhost:${PORT}/api/health`);
});
