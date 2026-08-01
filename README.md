# QuickCart Live

QuickCart Live is a real-time e-commerce application consisting of a Node.js + Express + MongoDB backend and a Flutter client built with GetX.

## Deployment Details

* **Production API Base URL**: `https://quickcart-live.onrender.com/api/v1`
* **Production Socket URL**: `https://quickcart-live.onrender.com`
* **Production Health Check**: `https://quickcart-live.onrender.com/api/v1/health`

---

## Workspace Structure

The project is structured as follows:

* **/backend**: Contains Node.js, Express, Socket.IO server, Mongoose models, and integration tests.
* **/frontend**: Contains the Flutter client mobile application setup with GetX state management.

---

## Getting Started

### Running the Backend Locally
Please refer to the [Backend README](file:///d:/QuickCart/backend/README.md) for environment configuration, seeding scripts, and server operations.

### Running the Flutter Client Locally
1. Navigate to `/frontend`
2. Run `flutter pub get`
3. Execute `flutter run` using your emulator or developer device.
