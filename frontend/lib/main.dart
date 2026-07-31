import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'core/bindings/initial_binding.dart';
import 'core/routes/app_pages.dart';
import 'core/routes/unknown_route_view.dart';
import 'core/storage/storage_service.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Async injection of StorageService (GetStorage init)
  // before app runs so it is available globally
  await Get.putAsync(() => StorageService().init());

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'QuickCart Live',
      debugShowCheckedModeBanner: false,
      
      // Theme Configuration
      theme: AppTheme.lightTheme,
      
      // Routing Configuration
      initialRoute: AppPages.initial,
      getPages: AppPages.pages,
      unknownRoute: GetPage(
        name: '/404',
        page: () => const UnknownRouteView(),
      ),
      
      // Dependency Injection Configuration
      initialBinding: InitialBinding(),
    );
  }
}
