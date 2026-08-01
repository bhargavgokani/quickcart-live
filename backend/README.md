# QuickCart Live Backend

Production-ready Node.js + Express REST API with real-time Socket.IO and MongoDB Atlas, prepared for seamless deployment on Render.

## Environment Variables

Configure these environment variables in your local `.env` file or in the **Environment** settings panel in the Render dashboard:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | The port the server runs on. Render assigns this automatically. | No (defaults to `5000`) | `5000` |
| `NODE_ENV` | Run environment profile. | No (defaults to `development`) | `production` |
| `MONGO_URI` | MongoDB Connection URI. Use a replica set connection string format if your local environment fails to resolve SRV records. | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for signing and verifying JSON Web Tokens. | Yes | `your-long-secure-random-jwt-secret-key` |
| `JWT_EXPIRES_IN` | Duration profile for JWT validity. | Yes | `7d` |
| `COOKIE_SECRET` | Secret key for parsing cookie signatures. | Yes | `your-long-secure-random-cookie-secret-key` |
| `CLIENT_URL` | Comma-separated list of allowed CORS client origins. | No (defaults to `http://localhost:3000`) | `http://localhost:3000,http://10.0.2.2:5000,https://quickcart.vercel.app` |

---

## How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure local environment variables**:
   Create a `.env` file in the root of the `backend/` folder following `.env.example` structure.

3. **Seed Database (Admin & Products)**:
   ```bash
   npm run seed
   ```

4. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

5. **Run Test Suites**:
   ```bash
   npm test
   ```

---

## How to Deploy on Render

1. Go to the **Render Dashboard** and select **New +** -> **Web Service**.
2. Connect your Git repository containing the QuickCart project.
3. Configure the following service settings:
   * **Name**: `quickcart-live-backend`
   * **Root Directory**: `backend` (if deploying from a monorepo setup)
   * **Language/Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Expand the **Advanced** section and add all required environment variables under the **Environment Variables** panel (see the table above).
5. Render will automatically provision the `PORT` and direct traffic to your Express application.
6. Verify your deployment health status using the health check endpoint:
   `https://your-service-name.onrender.com/api/v1/health`
