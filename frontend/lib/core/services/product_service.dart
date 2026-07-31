import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../network/api_service.dart';

class ProductService extends GetxService {
  final ApiService _api = Get.find<ApiService>();

  /// Fetches all active products from the backend.
  /// Throws Exception if the request fails.
  Future<List<Map<String, dynamic>>> getProducts() async {
    try {
      final http.Response response = await _api.get('/products');
      final Map<String, dynamic> body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        final List<dynamic> list = body['data'] ?? [];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      } else {
        throw Exception(body['message'] ?? 'Failed to fetch products.');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Fetches a single product details by ID.
  /// Throws Exception if the product is not found.
  Future<Map<String, dynamic>> getProduct(String id) async {
    try {
      final http.Response response = await _api.get('/products/$id');
      final Map<String, dynamic> body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        return Map<String, dynamic>.from(body['data']);
      } else {
        throw Exception(body['message'] ?? 'Failed to fetch product details.');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
