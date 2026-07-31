import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../network/api_service.dart';

class AuthService extends GetxService {
  final ApiService _api = Get.find<ApiService>();

  /// Sends a registration request to the backend.
  /// Throws Exception if the request fails.
  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    try {
      final http.Response response = await _api.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
      });

      final Map<String, dynamic> body = jsonDecode(response.body);
      if (response.statusCode == 201 && body['success'] == true) {
        return body;
      } else {
        throw Exception(body['message'] ?? 'Failed to register account.');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Sends a login request to the backend.
  /// Throws Exception if the credentials are invalid.
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final http.Response response = await _api.post('/auth/login', {
        'email': email,
        'password': password,
      });

      final Map<String, dynamic> body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return body['data'];
      } else {
        throw Exception(body['message'] ?? 'Invalid email or password.');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
