require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./database');

const cars = [
  {
    brand: 'Porsche', model: '911 Carrera S', year: 2024, price: 16500000, mileage: 0,
    fuel: 'Бензин', transmission: 'Автомат', status: 'В наличии',
    engine: '3.0L Рядный 6', horsepower: 450, color: 'Черный сапфир',
    description: 'Легендарный спорткар с идеальным балансом мощности и стиля.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&crop=center&auto=format',
    images: '[]', vin: 'WP0ZZZ91ZPR123456'
  }
];

const carCount = db.prepare('SELECT COUNT(*) as c FROM cars').get().c;
if (carCount === 0) {
  const insertCar = db.prepare(`
    INSERT INTO cars (brand, model, year, price, mileage, fuel, transmission, status, engine, horsepower, color, description, image, vin, images)
    VALUES (@brand, @model, @year, @price, @mileage, @fuel, @transmission, @status, @engine, @horsepower, @color, @description, @image, @vin, @images)
  `);
  for (const car of cars) {
    insertCar.run(car);
  }
  console.log('Каталог успешно заполнен первоначальными машинами');
}

const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@autopremium.ru'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (name, email, password_hash, phone, role, position)
    VALUES (?, ?, ?, ?, 'admin', 'Администратор')
  `).run('Администратор', 'admin@autopremium.ru', hash, '+7 (800) 123-45-67');
  console.log('Создан администратор: admin@autopremium.ru / admin123');
}