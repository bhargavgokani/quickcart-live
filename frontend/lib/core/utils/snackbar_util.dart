import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SnackbarUtil {
  static void success(String message, {String title = 'Success'}) {
    Get.snackbar(
      title,
      message,
      snackPosition: SnackPosition.TOP,
      backgroundColor: const Color(0xFF10B981), // Emerald Green
      colorText: Colors.white,
      icon: const Icon(Icons.check_circle_rounded, color: Colors.white, size: 28),
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      boxShadows: const [
        BoxShadow(
          color: Color.fromRGBO(16, 185, 129, 0.3),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ],
    );
  }

  static void error(String message, {String title = 'Error'}) {
    Get.snackbar(
      title,
      message,
      snackPosition: SnackPosition.TOP,
      backgroundColor: const Color(0xFFEF4444), // Coral Red
      colorText: Colors.white,
      icon: const Icon(Icons.error_rounded, color: Colors.white, size: 28),
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 4),
      boxShadows: const [
        BoxShadow(
          color: Color.fromRGBO(239, 68, 68, 0.3),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ],
    );
  }

  static void info(String message, {String title = 'Info'}) {
    Get.snackbar(
      title,
      message,
      snackPosition: SnackPosition.TOP,
      backgroundColor: const Color(0xFF2563EB), // Primary Blue
      colorText: Colors.white,
      icon: const Icon(Icons.info_rounded, color: Colors.white, size: 28),
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 3),
      boxShadows: const [
        BoxShadow(
          color: Color.fromRGBO(37, 99, 235, 0.3),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ],
    );
  }

  static void warning(String message, {String title = 'Warning'}) {
    Get.snackbar(
      title,
      message,
      snackPosition: SnackPosition.TOP,
      backgroundColor: const Color(0xFFF59E0B), // Amber Warning
      colorText: Colors.white,
      icon: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 28),
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 4),
      boxShadows: const [
        BoxShadow(
          color: Color.fromRGBO(245, 158, 11, 0.3),
          blurRadius: 12,
          offset: Offset(0, 4),
        ),
      ],
    );
  }
}
