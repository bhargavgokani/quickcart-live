# QuickCart Live - Deployment Guide

This document describes how to build, configure, and release the QuickCart Live application.

---

## 1. Backend Production Deployment (Render Web Service)

The backend is configured for deployment on cloud container hosts like **Render**.

### Step-by-Step Render Setup
1. Create a **New Web Service** from the Render dashboard.
2. Link your Git repository.
3. Configure target build properties:
   * **Name**: `quickcart-live-backend`
   * **Root Directory**: `backend`
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Expand the **Advanced** section to include all production Environment Variables (see below).
5. Deploy. Render will automatically assign port allocations using `process.env.PORT` and proxy HTTPS traffic securely.

---

## 2. Environment Variables Configuration

Configure these parameters under the environment dashboard panel of your host:

| Variable Name | Required | Description | Example Value |
|---------------|----------|-------------|---------------|
| `PORT` | No | Express listening port (automatically populated by Render). | `10000` |
| `NODE_ENV` | Yes | Defines error handling filters and logs formatting. Set to `production`. | `production` |
| `MONGO_URI` | Yes | MongoDB connection URI. Use traditional replica-set string format. | `mongodb://user:pass@host:27017/db?replicaSet=atlas-xxx` |
| `JWT_SECRET` | Yes | Secret key for validation of security tokens. | `long-secure-random-phrase` |
| `JWT_EXPIRES_IN` | Yes | Valid window duration of auth cookies. | `7d` |
| `COOKIE_SECRET` | Yes | Secret key for verification of cookies. | `long-secure-random-phrase-2` |
| `CLIENT_URL` | Yes | Comma-separated list of CORS origins. Include your live web apps and local dev ports. | `https://quickcart-live.vercel.app,http://localhost:3000` |

---

## 3. Flutter Release Build Preparation

To package the Flutter application for release distribution:

### Configure AppConfig
Ensure [app_config.dart](file:///d:/QuickCart/frontend/lib/core/config/app_config.dart) has `environment` set to `'production'`:
```dart
class AppConfig {
  static const String environment = 'production';
  // ...
}
```

### Build Android release APK
Navigate to `frontend/` directory and execute:
```bash
flutter build apk --release
```
This generates the release-optimized, obfuscated Android Package (APK) at:
`frontend/build/app/outputs/flutter-apk/app-release.apk`

---

## 4. Live Verification Tasks
After deploying, verify endpoint configurations by checking:
`https://quickcart-live.onrender.com/api/v1/health`
The return body should print:
```json
{
  "success": true,
  "message": "QuickCart Live Backend Running",
  "environment": "production",
  "version": "1.0.0",
  "timestamp": "2026-08-01T22:05:19.000Z"
}
```
If this endpoint loads correctly, your Render container deployment is fully operational.
