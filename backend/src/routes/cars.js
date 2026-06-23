const express = require('express');
const db = require('../db/database');
const { formatCar, buildCarFilters, buildSort } = require('../utils/cars');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { where, params } = buildCarFilters(req.query);
    const orderClause = buildSort(req.query.sort);

    const limit = parseInt(req.query.limit, 10) || 12;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM cars ${where}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const queryParams = [...params, limit, offset];
    const rows = db.prepare(`
      SELECT * FROM cars 
      ${where} 
      ${orderClause} 
      LIMIT ? OFFSET ?
    `).all(...queryParams);

    res.json({
      data: rows.map(formatCar),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!car) return res.status(404).json({ error: 'Автомобиль не найден' });
  res.json(formatCar(car));
});

module.exports = router;