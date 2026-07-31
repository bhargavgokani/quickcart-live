import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../network/api_service.dart';

class OrderService extends GetxService {
  final ApiService _api = Get.find<ApiService>();

  /// Places a new order (checkout) for a single unit of the product.
  /// Throws Exception if checkout fails.
  Future<Map<String, dynamic>> checkout(String productId) async {
    try {
      final http.Response response = await _api.post('/checkout', {
        'productId': productId,
      });

      final Map<String, dynamic> body = jsonDecode(response.body);
      if (response.statusCode == 201 && body['success'] == true) {
        return Map<String, dynamic>.from(body['data']);
      } else {
        // Return structured information so controllers can identify Out of Stock vs other errors
        throw http.Response(
          response.body,
          response.statusCode,
          headers: response.headers,
          request: response.request,
        );
      }
    } catch (e) {
      if (e is http.Response) {
        rethrow;
      }
      throw Exception(e.toString());
    }
  }

  /// Fetches order history for the logged-in customer.
  /// Throws Exception if the request fails.
  Future<List<Map<String, dynamic>>> getOrders() async {
    try {
      final http.Response response = await _api.get('/orders');
      final Map<String, dynamic> body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        final List<dynamic> list = body['data'] ?? [];
        return list.map((item) => Map<String, dynamic>.from(item)).toList();
      } else {
        throw Exception(body['message'] ?? 'Failed to fetch orders.');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
