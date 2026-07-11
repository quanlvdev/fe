# Team Task Manager Frontend

## Setup

```bash
cd fe
npm install
cp .env.example .env
npm run dev
```

Default API URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run a production build:

```bash
npm run build
```

## Login

Seeded users:

- Admin: `admin@example.com` / `password`
- User: `user@example.com` / `password`

The frontend uses the bearer token returned by `POST /api/login` and stores it in `localStorage`.

## Implemented

- `/login` route
- `/tasks` protected route
- Login form with error handling
- Current user's name and role in the app bar
- Tasks table with title, assignee, status, due date, and actions
- Server-side status filter, title search, and pagination
- Reusable `TaskForm.vue` for create/edit
- User role handling through backend authorization
