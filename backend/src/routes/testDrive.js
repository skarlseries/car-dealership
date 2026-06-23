const express = require('express');
const db = require('../db/database');

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10;
}

router.post('/', (req, res) => {
  const {
    name,
    phone,
    email,
    date,
    time,
    carId,
    carName,
    message,
    type = 'Тест-драйв'
  } = req.body;

  if (!name || !phone || !date || !time) {
    return res.status(400).json({ error: 'Имя, телефон, дата и время обязательны' });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ error: 'Некорректный формат email' });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: 'Телефон должен содержать не менее 10 цифр' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    return res.status(400).json({ error: 'Дата не может быть в прошлом' });
  }

  let resolvedCarName = carName;
  if (carId) {
    const car = db.prepare('SELECT brand, model FROM cars WHERE id = ?').get(carId);
    if (car) {
      resolvedCarName = `${car.brand} ${car.model}`;
    }
  }

  const result = db.prepare(`
    INSERT INTO requests (name, phone, email, car_id, car_name, request_date, request_time, type, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Новая')
  `).run(name, phone, email || null, carId || null, resolvedCarName || null, date, time, type, message || null);

  res.status(201).json({ id: result.lastInsertRowid, success: true });
});

module.exports = router;