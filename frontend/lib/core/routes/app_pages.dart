import 'package:get/get.dart';
import '../../modules/auth/bindings/auth_binding.dart';
import '../../modules/auth/views/login_view.dart';
import '../../modules/auth/views/register_view.dart';
import '../../modules/dashboard/bindings/dashboard_binding.dart';
import '../../modules/dashboard/views/dashboard_view.dart';
import '../../modules/order/bindings/order_binding.dart';
import '../../modules/order/views/order_list_view.dart';
import '../../modules/product/bindings/product_binding.dart';
import '../../modules/product/views/product_list_view.dart';
import 'app_routes.dart';

class AppPages {
  static const initial = Routes.login;

  static final pages = [
    GetPage(
      name: Routes.login,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: Routes.register,
      page: () => const RegisterView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: Routes.dashboard,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
    ),
    GetPage(
      name: Routes.products,
      page: () => const ProductListView(),
      binding: ProductBinding(),
    ),
    GetPage(
      name: Routes.orders,
      page: () => const OrderListView(),
      binding: OrderBinding(),
    ),
  ];
}
