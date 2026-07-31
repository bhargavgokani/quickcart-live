class AppConfig {
  static const String environment = 'development';
  
  // Note: 10.0.2.2 is the special alias to loopback interface of your development host on Android emulator.
  // Use localhost or local IP for iOS simulator / real devices.
  static const String apiBaseUrl = 'http://10.0.2.2:5000/api/v1';
  static const String socketUrl = 'http://10.0.2.2:5000';
}
