import 'package:flutter/foundation.dart';

class Logger {
  static void info(String message) {
    if (kDebugMode) {
      print('💡 [INFO] ${DateTime.now()}: $message');
    }
  }

  static void warning(String message) {
    if (kDebugMode) {
      print('⚠️ [WARNING] ${DateTime.now()}: $message');
    }
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      print('❌ [ERROR] ${DateTime.now()}: $message');
      if (error != null) print('Detail: $error');
      if (stackTrace != null) print(stackTrace);
    }
  }
}
