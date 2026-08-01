# QuickCart Live - Frontend Mobile App

QuickCart Live is a real-time, responsive mobile client built with Flutter using GetX state management, supporting dynamic user authentications, reactive inventory lists, live stock counters via WebSockets, and clear checkout conflict notifications.

---

## Technical Stack & Packages

* **State Management & DI**: [GetX](https://pub.dev/packages/get)
* **Real-time WebSockets**: [Socket.IO Client Dart](https://pub.dev/packages/socket_io_client)
* **Local Storage**: [GetStorage](https://pub.dev/packages/get_storage)
* **HTTP Requests**: [http](https://pub.dev/packages/http)
* **Design Guidelines**: Material 3 (with support for responsive layouts, adaptive loaders, and clear error fallbacks)

---

## App Architecture (GetX MVVM Pattern)

The frontend follows the Model-View-ViewModel (MVVM) architecture with decoupled global services:

```
frontend/lib/
├── core/
│   ├── bindings/       # Initial app startup injections
│   ├── config/         # AppConfig environment profile
│   ├── constants/      # AppConstants (Socket events, roles)
│   ├── network/        # ApiService HTTP client
│   ├── routes/         # AppPages & AppRoutes definitions
│   ├── storage/        # StorageService (JWT & Cache)
│   └── utils/          # SnackBar & logger helpers
└── modules/
    ├── auth/           # Login, Register, Splash Views & Controller
    ├── dashboard/      # Welcome profile card, Logout, Product List
    ├── order/          # Order History Card List & Controller
    └── product/        # Product Specifications Detail Page & Controller
```

---

## Setup & Execution

### 1. Pre-requisites
* Install [Flutter SDK (Stable Channel)](https://docs.flutter.dev/get-started/install).
* Connect an Android Emulator (default host loopback `10.0.2.2`), iOS Simulator (`localhost`), or a physical developer device.

### 2. Install Packages
Navigate to `/frontend` and execute:
```bash
flutter pub get
```

### 3. Environment Configuration
Toggle the environment switch in [app_config.dart](file:///d:/QuickCart/frontend/lib/core/config/app_config.dart) depending on your target:
* Set `environment = 'development'` to run against your local Express host (`http://10.0.2.2:5000`).
* Set `environment = 'production'` to point to the live Render cloud service.

### 4. Run Application
```bash
flutter run
```

---

## Automated Quality Verification
To audit code formatting and ensure 0 compilation issues:
```bash
flutter analyze
```
Our release code passes with **0 warnings, errors, or lints**.
