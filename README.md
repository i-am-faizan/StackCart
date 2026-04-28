# Full Stack E-Commerce (MERN)

Interview-ready MERN e-commerce project with independent frontend and backend apps.

## Project Structure

```text
.
├── frontend/                 # React + Vite app
│   ├── src/
│   ├── .env.example
│   └── package.json
├── backend/                  # Node + Express + MongoDB API
│   ├── src/
│   ├── uploads/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Features Covered

### Frontend Pages

- Home / product listing (search + category filter)
- Product detail page
- Cart page
- Checkout page
- Login/Register pages
- Admin add/edit/delete product page
- Order history page for logged-in user

### Backend Modules

- Auth: register, login, profile (`JWT`)
- Products: full CRUD + image upload
- Categories: full CRUD
- Cart: add, update, remove, clear
- Orders: place, list (user), list (admin), update status

### Collections

- `users`
- `categories`
- `products`
- `cart_items`
- `orders`
- `order_items`

## Run Separately (Your Preferred Flow)

## 1. Backend setup and run

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/stackcart
JWT_SECRET=replace_with_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_REGISTRATION_KEY=replace_with_long_random_admin_key
```

Run backend:

```bash
npm run dev
```

## 2. Frontend setup and run

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_HOST=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Frontend URL (default): `http://localhost:5173`  
Backend URL (default): `http://localhost:5000`

## Notes

- Passwords are hashed with `bcryptjs` (never plain text).
- Auth uses JWT bearer tokens.
- APIs use request validation (`express-validator`).
- Product images are served from `/uploads`.
- Keep secrets only in `.env`, never in Git.
- Login routes are split:
  - User login: `/login` (uses `/api/auth/login`)
  - User register: `/register` (uses `/api/auth/register`)
  - Admin login: `/admin/login` (uses `/api/auth/admin/login`)
  - Admin register: `/admin/register` (uses `/api/auth/admin/register`, requires `ADMIN_REGISTRATION_KEY`)
