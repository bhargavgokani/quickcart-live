import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../widgets/app_empty_state_widget.dart';
import 'app_routes.dart';

class UnknownRouteView extends StatelessWidget {
  const UnknownRouteView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Page Not Found')),
      body: AppEmptyStateWidget(
        title: '404: Page Not Found',
        message: 'The requested page could not be located or has been moved.',
        icon: Icons.find_in_page_outlined,
        actionWidget: ElevatedButton(
          onPressed: () => Get.offAllNamed(Routes.dashboard),
          child: const Text('Back to Home'),
        ),
      ),
    );
  }
}
