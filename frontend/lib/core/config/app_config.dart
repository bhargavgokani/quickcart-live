class AppConfig {
  // Simple environment switch: set to 'development' or 'production'
  static const String environment = 'production';
  
  static const String apiBaseUrl = environment == 'production'
      ? 'https://quickcart-live.onrender.com/api/v1'
      : 'http://10.0.2.2:5000/api/v1';
      
  static const String socketUrl = environment == 'production'
      ? 'https://quickcart-live.onrender.com'
      : 'http://10.0.2.2:5000';
}
