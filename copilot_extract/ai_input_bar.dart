class AiInputBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onMic;
  final VoidCallback onStop;

  const AiInputBar({
    super.key,
    required this.controller,
    required this.onSend,
    required this.onMic,
    required this.onStop,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A1E) : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? Colors.white10 : Colors.black12,
            ),
          ),
        ),
        child: Row(
          children: [
            // MIC
            IconButton(
              onPressed: onMic,
              icon: Icon(
                Icons.mic_rounded,
                color: isDark ? Colors.deepPurple.shade200 : Colors.deepPurple,
                size: 28,
              ),
            ),

            // TEXT FIELD
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF2A2A2E) : const Color(0xFFF2F2F7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: TextField(
                  controller: controller,
                  minLines: 1,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: "Escribe tu mensaje...",
                  ),
                ),
              ),
            ),

            const SizedBox(width: 8),

            // SEND BUTTON
            IconButton(
              onPressed: onSend,
              icon: Icon(
                Icons.send_rounded,
                color: isDark ? Colors.deepPurple.shade200 : Colors.deepPurple,
                size: 26,
              ),
            ),

            // STOP BUTTON
            IconButton(
              onPressed: onStop,
              icon: Icon(
                Icons.stop_circle_rounded,
                color: Colors.redAccent,
                size: 30,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
