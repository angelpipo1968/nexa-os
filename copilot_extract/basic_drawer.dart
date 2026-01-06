import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Drawer Template',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  void _onSelectItem(BuildContext context, String title) {
    Navigator.pop(context); // close the drawer
    // handle navigation or actions here
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Selected: $title')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Drawer Example'),
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const UserAccountsDrawerHeader(
              accountName: Text('Angel'),
              accountEmail: Text('angel@example.com'),
              currentAccountPicture: CircleAvatar(
                child: Text('A'),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () => _onSelectItem(context, 'Home'),
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () => _onSelectItem(context, 'Settings'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () => _onSelectItem(context, 'Logout'),
            ),
          ],
        ),
      ),
      body: const Center(
        child: Text('Main content goes here'),
      ),
    );
  }
}
