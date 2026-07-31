import 'package:flutter/material.dart';

class UnknownRouteView extends StatelessWidget {
  const UnknownRouteView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('404')),
      body: const Center(
        child: Text(
          '404: Route Not Found',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
