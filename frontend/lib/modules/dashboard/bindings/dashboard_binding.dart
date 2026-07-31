import 'package:get/get.dart';
import '../../product/controllers/product_controller.dart';
import '../controllers/dashboard_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DashboardController>(() => DashboardController());
    Get.lazyPut<ProductController>(() => ProductController());
  }
}
