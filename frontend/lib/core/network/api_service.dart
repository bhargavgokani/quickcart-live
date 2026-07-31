import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../storage/storage_service.dart';

class ApiService extends GetxService {
  final String baseUrl = AppConfig.apiBaseUrl;
  final StorageService _storage = Get.find<StorageService>();

  Map<String, String> _getHeaders() {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final String? token = _storage.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  Future<http.Response> get(String endpoint) async {
    final Uri url = Uri.parse('$baseUrl$endpoint');
    return http.get(url, headers: _getHeaders());
  }

  Future<http.Response> post(String endpoint, dynamic body) async {
    final Uri url = Uri.parse('$baseUrl$endpoint');
    return http.post(
      url,
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
  }

  Future<http.Response> put(String endpoint, dynamic body) async {
    final Uri url = Uri.parse('$baseUrl$endpoint');
    return http.put(
      url,
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
  }

  Future<http.Response> patch(String endpoint, dynamic body) async {
    final Uri url = Uri.parse('$baseUrl$endpoint');
    return http.patch(
      url,
      headers: _getHeaders(),
      body: jsonEncode(body),
    );
  }

  Future<http.Response> delete(String endpoint) async {
    final Uri url = Uri.parse('$baseUrl$endpoint');
    return http.delete(url, headers: _getHeaders());
  }
}
