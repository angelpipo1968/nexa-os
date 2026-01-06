import 'package:flutter/material.dart';
import 'logo_forge.dart';
import 'media_studio.dart';

// Definición de una Aplicación en el sistema
class AppDefinition {
  final String id;
  final String name;
  final String subtitle;
  final IconData icon;
  final Color color;
  final WidgetBuilder builder;

  const AppDefinition({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.builder,
  });
}

// Registro Central de Aplicaciones
class AppRegistry {
  static final Map<String, AppDefinition> registry = {
    'chatbot': AppDefinition(
      id: 'chatbot',
      name: 'Chat Robot',
      subtitle: 'Asistente IA Avanzado',
      icon: Icons.chat_bubble_outline,
      color: Colors.cyanAccent,
      builder: (context) => const Center(child: Text("Chat Bot - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'nexa_creator': AppDefinition(
      id: 'nexa_creator',
      name: 'NEXA Creator',
      subtitle: 'Generador de Arte',
      icon: Icons.brush,
      color: Colors.pinkAccent,
      builder: (context) => const Center(child: Text("NEXA Creator - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'logo_forge': AppDefinition(
      id: 'logo_forge',
      name: 'Logo Studio',
      subtitle: 'Diseña tu marca',
      icon: Icons.auto_fix_high,
      color: Colors.purpleAccent,
      builder: (context) => const LogoForge(),
    ),
    'media_studio': AppDefinition(
      id: 'media_studio',
      name: 'Media Studio',
      subtitle: 'Video e Imágenes',
      icon: Icons.movie_filter,
      color: Colors.redAccent,
      builder: (context) => const MediaStudio(),
    ),
    'living_machine': AppDefinition(
      id: 'living_machine',
      name: 'Living Machine',
      subtitle: 'Simulación Bio-Digital',
      icon: Icons.eco,
      color: Colors.greenAccent,
      builder: (context) => const Center(child: Text("Living Machine - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'security': AppDefinition(
      id: 'security',
      name: 'Security Shield',
      subtitle: 'Ciberseguridad',
      icon: Icons.security,
      color: Colors.blueGrey,
      builder: (context) => const Center(child: Text("Security - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'web_dev': AppDefinition(
      id: 'web_dev',
      name: 'Web Dev Console',
      subtitle: 'Desarrollo Web',
      icon: Icons.language,
      color: Colors.orangeAccent,
      builder: (context) => const Center(child: Text("Web Dev - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'research': AppDefinition(
      id: 'research',
      name: 'Deep Research',
      subtitle: 'Investigación',
      icon: Icons.search,
      color: Colors.tealAccent,
      builder: (context) => const Center(child: Text("Deep Research - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
    'terminal': AppDefinition(
      id: 'terminal',
      name: 'System Terminal',
      subtitle: 'Línea de Comandos',
      icon: Icons.terminal,
      color: Colors.grey,
      builder: (context) => const Center(child: Text("Terminal - Módulo en Desarrollo", style: TextStyle(color: Colors.white))),
    ),
  };

  static List<AppDefinition> get allApps => registry.values.toList();
  static AppDefinition? getApp(String id) => registry[id];
}
