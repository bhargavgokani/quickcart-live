# QuickCart Live - Backend API Server

QuickCart Live Backend is a production-ready Express API with MongoDB Mongoose storage, Socket.IO websocket broadcasting, and comprehensive Jest unit/integration test coverage.

---

## Environment Variables

Configure these settings inside `backend/.env` or in the host environment settings panel:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | The port the server runs on. | No (defaults to `5000`) | `5000` |
| `NODE_ENV` | Mode profile (`development` / `production`). | No | `production` |
| `MONGO_URI` | MongoDB Connection URI. Use a traditional replica-set string format if SRV lookups fail. | Yes | `mongodb://user:pass@host:27017/db` |
| `JWT_SECRET` | Secret key for signing authorization tokens. | Yes | `secure-jwt-key` |
| `JWT_EXPIRES_IN` | Validity window for JWT. | Yes | `7d` |
| `COOKIE_SECRET` | Secret key for cookie verification. | Yes | `secure-cookie-key` |
| `CLIENT_URL` | Comma-separated list of allowed CORS client origins. | No | `https://quickcart-live.vercel.app,http://localhost:3000` |

---

## Workspace Architecture

```
backend/
├── src/
│   ├── config/         # Database, Sockets, and Env Validation
│   ├── constants/      # App roles and socket notification events
│   ├── controllers/    # API requests logic
│   ├── middleware/     # Auth checks, error handling, 404 gates
│   ├── models/         # User, Product, Order Schemas
│   ├── routes/         # Central routes registry
│   ├── services/       # Business logic & atomic checkout operations
│   └── tests/          # Integration and unit tests
├── server.js           # Server startup script
├── app.js              # Express routing definitions
├── package.json        # Dependencies list
└── jest.setup.js       # Global tests injection
```

---

## Setup & Running Locally

1. **Install Packages**:
   ```bash
   npm install
   ```
2. **Seed Local Database**:
   Runs the automated admin creation and product seeding helper script:
   ```bash
   npm run seed
   ```
3. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   The local server is available at `http://localhost:5000`.

---

## Verification & Testing
To execute Jest integration tests (covering user creations, auth checks, admin inventory gates, and the checkout concurrency suites):
```bash
npm test
```
All **54 integration test suites** pass successfully.