# LinkTD

Тестовый проект системы сокращения ссылок на стеке React + Redux + Node.js + Express.

## Реализовано

- Сокращение ссылки через API и UI.
- Выдача 2 ссылок после создания:
  - Для шаринга: `/{shortCode}`
  - Для статистики: `/{shortCode}+`
- Сбор статистики переходов:
  - дата/время
  - IP
  - регион, страна, город (через публичный API ip-api.com)
  - браузер и версия
  - ОС и версия
- Визуализация данных в интерфейсе:
  - топ браузеров
  - топ регионов
  - таблица переходов

## Архитектура

- `backend/` — Express API, редиректы и сбор аналитики.
- `frontend/` — React + Redux Toolkit, формы, таблица и графики.
- Хранилище на backend: `backend/src/data/db.json`.

Backend слои:

- `backend/src/routes/` — только маршрутизация (`routes/index.js`, `routes/apiRoutes.js`, `routes/redirectRoutes.js`).
- `backend/src/controllers/` — работа с `req/res`, HTTP-ответы и статусы.
- `backend/src/services/` — бизнес-логика без `req/res`.
- `backend/src/middleware/` — cross-cutting middleware (логирование, обработка ошибок).
- `backend/src/utils/` — переиспользуемые утилиты (например, cache headers).

## Запуск

### Переменные хостов

Хост-адреса ссылок задаются через env-переменные.

Backend:

- BASE_URL: базовый домен коротких ссылок и ссылки статистики (формат /shortCode и /shortCode+)
- FRONTEND_BASE_URL: базовый домен UI статистики (редирект на /#/stats/shortCode)

Frontend:

- VITE_API_URL: адрес backend API

Локально (пример):

- BASE_URL=http://localhost:4000
- FRONTEND_BASE_URL=http://localhost:5173
- VITE_API_URL=http://localhost:4000/api

При деплое (пример):

- BASE_URL=https://api.your-domain.com
- FRONTEND_BASE_URL=https://app.your-domain.com
- VITE_API_URL=https://api.your-domain.com/api

### Быстрый запуск из корня

Из корня проекта:

npm install
npm run dev

Команда поднимет одновременно backend и frontend.

### Публичные ссылки для внешней проверки статистики

Если вы используете Serveo (или другой внешний reverse tunnel), отдельные дополнительные скрипты публикации не требуются.

Используйте один способ публикации и держите актуальные значения в env:

- [backend/.env](backend/.env): `BASE_URL`, `FRONTEND_BASE_URL`
- [frontend/.env](frontend/.env): `VITE_API_URL` (с префиксом `/api`)

После смены публичного домена:

1. Обновите env-файлы.
2. Перезапустите backend и frontend.
3. Создайте новую короткую ссылку.

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Сервер по умолчанию: `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Клиент по умолчанию: `http://localhost:5173`

## API

### POST `/api/links`

Создать короткую ссылку.

Body:

```json
{
  "url": "https://example.com/some/long/path"
}
```

Response:

```json
{
  "id": "...",
  "originalUrl": "https://example.com/some/long/path",
  "shareUrl": "http://localhost:4000/abc1234",
  "statsUrl": "http://localhost:4000/abc1234+",
  "statsPageUrl": "http://localhost:5173/#/stats/abc1234",
  "shortCode": "abc1234",
  "statsCode": "veryLongToken",
  "createdAt": "2026-04-14T10:00:00.000Z"
}
```

### GET `/:shortCode`

Редирект на оригинальный URL + запись события перехода.

### GET `/:shortCode+`

Переход на страницу статистики по короткой ссылке.


## Примечания

- В бесплатном тарифе ip-api.com есть лимиты запросов.
- Автоматические хиты (bot/crawler/prefetch/empty user-agent) не попадают в статистику переходов.
