class AppConstants {
  static const String tokenKey = 'jwt_token';
  static const String userKey = 'auth_user';
}

class Roles {
  static const String admin = 'ADMIN';
  static const String customer = 'CUSTOMER';
}

class SocketEvents {
  static const String stockUpdated = 'stockUpdated';
  static const String productCreated = 'productCreated';
  static const String productUpdated = 'productUpdated';
  static const String productDeleted = 'productDeleted';
}
