import 'package:flutter/material.dart';
import 'dart:math' as math;

class LogoForge extends StatefulWidget {
  const LogoForge({super.key});

  @override
  State<LogoForge> createState() => _LogoForgeState();
}

class _LogoForgeState extends State<LogoForge> {
  String _logoText = "NEXA";
  String _selectedStyle = "Cyberpunk";
  bool _isGenerating = false;
  
  final Map<String, LogoStyle> _styles = {
    'Cyberpunk': LogoStyle(
      bg: const Color(0xFF0F172A),
      text: const Color(0xFF22D3EE),
      accent: const Color(0xFFD946EF),
      fontFamily: 'Courier',
    ),
    'Minimalist': LogoStyle(
      bg: Colors.white,
      text: const Color(0xFF18181B),
      accent: Colors.black,
      fontFamily: 'Sans-serif',
    ),
    'Abstract': LogoStyle(
      bg: const Color(0xFF18181B),
      text: const Color(0xFFF472B6),
      accent: const Color(0xFF8B5CF6),
      fontFamily: 'Sans-serif',
    ),
    'Organic': LogoStyle(
      bg: const Color(0xFF14532D),
      text: const Color(0xFFDCFCE7),
      accent: const Color(0xFF22C55E),
      fontFamily: 'Serif',
    ),
  };

  void _generate() {
    setState(() => _isGenerating = true);
    // Simulate generation delay
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) setState(() => _isGenerating = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final style = _styles[_selectedStyle]!;

    return Container(
      color: const Color(0xFF1E1E1E),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            children: [
              Icon(Icons.auto_fix_high, color: Colors.purpleAccent, size: 28),
              const SizedBox(width: 12),
              Text(
                "Logo Forge",
                style: TextStyle(
                  fontSize: 24, 
                  fontWeight: FontWeight.bold,
                  color: Colors.white
                ),
              ),
            ],
          ),
          const SizedBox(height: 30),

          // Controls
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Brand Name", style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 8),
                TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.black26,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  onChanged: (val) => setState(() => _logoText = val),
                  controller: TextEditingController(text: _logoText),
                ),
                const SizedBox(height: 20),
                const Text("Visual Style", style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedStyle,
                      dropdownColor: const Color(0xFF2A2A2E),
                      isExpanded: true,
                      style: const TextStyle(color: Colors.white),
                      items: _styles.keys.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedStyle = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: _isGenerating 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                      : const Icon(Icons.bolt),
                    label: Text(_isGenerating ? "FORGING..." : "GENERATE IDENTITY"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple.shade700,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isGenerating ? null : _generate,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // Preview Area
          Expanded(
            child: Center(
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  color: style.bg,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: style.accent.withOpacity(0.3),
                      blurRadius: 30,
                      spreadRadius: 5,
                    )
                  ],
                ),
                child: CustomPaint(
                  painter: LogoPainter(
                    text: _logoText,
                    style: style,
                    type: _selectedStyle,
                  ),
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Download
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
               IconButton(
                 onPressed: () {}, 
                 icon: const Icon(Icons.share, color: Colors.white70),
                 tooltip: "Share",
               ),
            ],
          )
        ],
      ),
    );
  }
}

class LogoStyle {
  final Color bg;
  final Color text;
  final Color accent;
  final String fontFamily;

  LogoStyle({required this.bg, required this.text, required this.accent, required this.fontFamily});
}

class LogoPainter extends CustomPainter {
  final String text;
  final LogoStyle style;
  final String type;

  LogoPainter({required this.text, required this.style, required this.type});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = style.accent
      ..style = PaintingStyle.fill;

    // Draw Abstract Background Shape
    if (type == 'Cyberpunk') {
      paint.shader = LinearGradient(
        colors: [style.accent.withOpacity(0.0), style.accent.withOpacity(0.2)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight
      ).createShader(Rect.fromLTWH(0,0,size.width,size.height));
      canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
      
      paint.shader = null;
      paint.color = style.text;
      paint.style = PaintingStyle.stroke;
      paint.strokeWidth = 2;
      canvas.drawCircle(center, 80, paint);
      canvas.drawCircle(center, 90, paint..color = style.accent.withOpacity(0.5));
    } else if (type == 'Minimalist') {
      paint.color = Colors.black12;
      canvas.drawCircle(center, 70, paint);
    } else if (type == 'Organic') {
      paint.color = style.accent.withOpacity(0.2);
       final path = Path();
       path.moveTo(center.dx, center.dy - 80);
       path.quadraticBezierTo(center.dx + 80, center.dy - 80, center.dx + 80, center.dy);
       path.quadraticBezierTo(center.dx + 80, center.dy + 80, center.dx, center.dy + 80);
       path.quadraticBezierTo(center.dx - 80, center.dy + 80, center.dx - 80, center.dy);
       path.quadraticBezierTo(center.dx - 80, center.dy - 80, center.dx, center.dy - 80);
       canvas.drawPath(path, paint);
    }

    // Draw Text
    final textSpan = TextSpan(
      text: text,
      style: TextStyle(
        color: style.text,
        fontSize: 32,
        fontWeight: FontWeight.bold,
        fontFamily: style.fontFamily,
        shadows: type == 'Cyberpunk' ? [Shadow(color: style.accent, blurRadius: 10)] : [],
      ),
    );
    
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    
    textPainter.layout();
    textPainter.paint(canvas, center - Offset(textPainter.width / 2, -40)); // Position below center

    // Draw Icon (Simple Geometric for now)
    final iconPaint = Paint()
      ..color = style.text
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    if (type == 'Cyberpunk') {
       final path = Path();
       path.moveTo(center.dx - 20, center.dy - 20);
       path.lineTo(center.dx + 20, center.dy - 20);
       path.lineTo(center.dx, center.dy + 20);
       path.close();
       canvas.drawPath(path, iconPaint);
    } else {
       canvas.drawRect(Rect.fromCenter(center: center - const Offset(0, 30), width: 40, height: 40), iconPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
