# AutoPremium Backend

REST API для сайта люксового автосалона AutoPremium (по спецификации требований).

## Стек

- Node.js + Express
- SQLite (better-sqlite3)
- JWT-авторизация

## Быстрый старт

```bash
cd backend
npm install
npm start
```

Сервер запустится на `http://localhost:3000` и одновременно раздаёт frontend из корня проекта.

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@autopremium.ru | admin123 |
| Менеджер | manager@autopremium.ru | manager123 |

## API Endpoints

### Публичные

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/cars` | Каталог с фильтрацией, сортировкой, пагинацией |
| GET | `/api/cars/:id` | Детали автомобиля |
| POST | `/api/test-drive` | Заявка на тест-драйв |
| POST | `/api/auth/register` | Регистрация клиента |
| POST | `/api/auth/login` | Вход |

**Параметры GET /api/cars:** `search`, `brand`, `maxPrice`, `year`, `fuel`, `transmission`, `sort` (price_asc, price_desc, year_desc, mileage_asc), `page`, `limit`

### Админ (Bearer token, роли admin/manager)

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/admin/stats` | KPI дашборда |
| GET | `/api/admin/requests` | Список заявок |
| PUT | `/api/admin/requests/:id` | Обновление статуса заявки |
| DELETE | `/api/admin/requests/:id` | Удаление заявки (admin) |
| GET | `/api/admin/cars` | Автопарк для админки |
| POST | `/api/admin/cars` | Добавление авто (admin) |
| PUT | `/api/admin/cars/:id` | Редактирование авто (admin) |
| DELETE | `/api/admin/cars/:id` | Удаление авто (admin) |

## Пример запроса

```bash
curl http://localhost:3000/api/cars?brand=Porsche&sort=price_desc

curl -X POST http://localhost:3000/api/test-drive \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Иван\",\"phone\":\"+79001234567\",\"date\":\"2026-06-25\",\"time\":\"14:00\",\"carId\":1}"

curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Переменные окружения

Скопируйте `.env.example` в `.env`:

- `PORT` — порт сервера (по умолчанию 3000)
- `JWT_SECRET` — секрет для JWT
- `CORS_ORIGIN` — разрешённые origins через запятую

## Пересоздание БД

Удалите файл `data/autopremium.db` и перезапустите сервер — seed-данные загрузятся автоматически.
