const express = require('express');
const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const { formatCar } = require('../utils/cars');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin', 'manager'));

function formatRequest(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    car: row.car_name,
    carId: row.car_id,
    date: row.request_date,
    time: row.request_time,
    type: row.type,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  };
}

router.get('/stats', (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().split('T')[0];

  const currentSales = db.prepare(`
    SELECT COALESCE(SUM(price), 0) as total
    FROM cars
    WHERE status = 'Продан' AND updated_at >= ?
  `).get(monthStart);

  const testDrivesTotal = db.prepare("SELECT COUNT(*) as c FROM requests WHERE type = 'Тест-драйв'").get().c;
  const testDrivesToday = db.prepare("SELECT COUNT(*) as c FROM requests WHERE type = 'Тест-драйв' AND request_date = ?").get().c;

  const activeCars = db.prepare("SELECT COUNT(*) as c FROM cars WHERE status = 'В наличии'").get().c;
  const totalCars = db.prepare("SELECT COUNT(*) as c FROM cars").get().c;

  // ИСПРАВЛЕНО: Теперь возвращается структура { total, needsAttention }, которую ожидает фронтенд
  const totalRequests = db.prepare("SELECT COUNT(*) as c FROM requests").get().c;
  const newRequests = db.prepare("SELECT COUNT(*) as c FROM requests WHERE status = 'Новая'").get().c;

  res.json({
    revenue: {
      current: currentSales.total,
      target: 50000000
    },
    testDrives: {
      total: testDrivesTotal,
      today: testDrivesToday
    },
    fleet: {
      active: activeCars,
      total: totalCars
    },
    requests: {
      total: totalRequests,
      needsAttention: newRequests
    }
  });
});

// ИСПРАВЛЕНО: Добавлена поддержка images при создании автомобиля
router.post('/cars', requireRole('admin'), (req, res) => {
  const {
    brand, model, year, price, mileage, fuel, transmission,
    status, engine, horsepower, color, description, image, vin, images
  } = req.body;

  if (!brand || !model || !year || !price || !image) {
    return res.status(400).json({ error: 'Марка, модель, год, цена и главное изображение обязательны' });
  }

  const imagesJson = Array.isArray(images) ? JSON.stringify(images) : '[]';

  try {
    const result = db.prepare(`
      INSERT INTO cars (brand, model, year, price, mileage, fuel, transmission, status, engine, horsepower, color, description, image, vin, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      brand, model, year, price, mileage || 0, fuel || 'Бензин',
      transmission || 'Автомат', status || 'В наличии', engine || null,
      horsepower || 0, color || null, description || null, image, vin || null, imagesJson
    );

    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatCar(car));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/cars/:id', requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Автомобиль не найден' });
  }

  const fields = ['brand', 'model', 'year', 'price', 'mileage', 'fuel', 'transmission', 'status', 'engine', 'horsepower', 'color', 'description', 'image', 'vin'];
  const updates = [];
  const params = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (req.body.images !== undefined) {
    updates.push('images = ?');
    params.push(JSON.stringify(req.body.images));
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'Нет данных для обновления' });
  }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE cars SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  res.json(formatCar(car));
});

router.delete('/cars/:id', requireRole('admin'), (req, res) => {
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/requests', (req, res) => {
  const rows = db.prepare('SELECT * FROM requests ORDER BY id DESC').all();
  res.json({ data: rows.map(formatRequest) });
});

router.put('/requests/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Статус не указан' });

  try {
    db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;