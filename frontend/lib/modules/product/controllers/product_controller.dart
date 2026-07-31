import 'dart:convert';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';
import '../../../core/services/order_service.dart';
import '../../../core/services/product_service.dart';
import '../../../core/services/socket_service.dart';
import '../../../core/utils/snackbar_util.dart';

class ProductController extends GetxController {
  final ProductService _productService = Get.find<ProductService>();

  final RxList<Map<String, dynamic>> products = <Map<String, dynamic>>[].obs;
  
  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final RxString errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
    listenSocketEvents();
  }

  /// Fetches products from the service. Updates loading and error states.
  Future<void> fetchProducts() async {
    _isLoading.value = true;
    errorMessage.value = '';
    try {
      final list = await _productService.getProducts();
      products.assignAll(list);
      _isLoading.value = false;
    } catch (e) {
      _isLoading.value = false;
      errorMessage.value = e.toString();
      SnackbarUtil.error('Failed to load products: $e');
    }
  }

  /// Performs a silent refresh of the product list (for pull-to-refresh indicator).
  Future<void> refreshProducts() async {
    errorMessage.value = '';
    try {
      final list = await _productService.getProducts();
      products.assignAll(list);
    } catch (e) {
      errorMessage.value = e.toString();
      SnackbarUtil.error('Failed to refresh products: $e');
    }
  }

  /// Purchases exactly one unit of a product
  Future<void> purchaseProduct(String productId, Function(bool success, String? error) callback) async {
    _isLoading.value = true;
    try {
      final orderService = Get.find<OrderService>();
      await orderService.checkout(productId);
      
      // Refresh list to pull latest stock as backup
      await fetchProducts();
      
      _isLoading.value = false;
      callback(true, null);
    } catch (e) {
      _isLoading.value = false;
      
      // Refresh current products list to sync latest stock with UI
      await fetchProducts();

      String errorMsg = e.toString();
      if (e is http.Response) {
        try {
          final body = jsonDecode(e.body);
          errorMsg = body['message'] ?? 'Checkout failed.';
        } catch (_) {}
      }
      callback(false, errorMsg);
    }
  }

  /// Register real-time Socket.IO listeners
  void listenSocketEvents() {
    final SocketService socketService = Get.find<SocketService>();
    
    // Listen for PRODUCT_CREATED -> append to products list (at index 0 for newest first)
    socketService.listen(SocketEvents.productCreated, (data) {
      if (data != null && data['product'] != null) {
        final newProduct = Map<String, dynamic>.from(data['product']);
        final exists = products.any((p) => p['_id'] == newProduct['_id']);
        if (!exists) {
          products.insert(0, newProduct);
        }
      }
    });

    // Listen for PRODUCT_UPDATED -> find and replace
    socketService.listen(SocketEvents.productUpdated, (data) {
      if (data != null && data['product'] != null) {
        final updatedProduct = Map<String, dynamic>.from(data['product']);
        final index = products.indexWhere((p) => p['_id'] == updatedProduct['_id']);
        if (index != -1) {
          products[index] = updatedProduct;
        }
      }
    });

    // Listen for PRODUCT_DELETED -> remove from list
    socketService.listen(SocketEvents.productDeleted, (data) {
      if (data != null && data['productId'] != null) {
        final String deletedId = data['productId'];
        products.removeWhere((p) => p['_id'] == deletedId);
      }
    });

    // Listen for STOCK_UPDATED -> update stock of matching product instantly
    socketService.listen(SocketEvents.stockUpdated, (data) {
      if (data != null && data['productId'] != null && data['stock'] != null) {
        final String prodId = data['productId'];
        final int newStock = (data['stock'] as num).toInt();
        final index = products.indexWhere((p) => p['_id'] == prodId);
        if (index != -1) {
          final updated = Map<String, dynamic>.from(products[index]);
          updated['stock'] = newStock;
          products[index] = updated;
        }
      }
    });
  }

  /// Unsubscribe from Socket.IO listeners
  void disposeSocket() {
    final SocketService socketService = Get.find<SocketService>();
    socketService.socket?.off(SocketEvents.productCreated);
    socketService.socket?.off(SocketEvents.productUpdated);
    socketService.socket?.off(SocketEvents.productDeleted);
    socketService.socket?.off(SocketEvents.stockUpdated);
  }

  @override
  void onClose() {
    disposeSocket();
    super.onClose();
  }
}
