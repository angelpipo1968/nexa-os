import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class NexaAI {
    private enum View { SETUP, AUTH, CHAT }
    private View currentView = View.SETUP;
    private User user;
    private boolean loading = false;
    private String error = "";
    private List<Message> messages = new ArrayList<>();
    private Scanner scanner = new Scanner(System.in);

    class User {
        String id;
        String email;
        String name;

        User(String id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }
    }

    class Message {
        String role;
        String content;

        Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }

    public void start() {
        while (true) {
            switch (currentView) {
                case SETUP:
                    showSetupView();
                    break;
                case AUTH:
                    showAuthView();
                    break;
                case CHAT:
                    showChatView();
                    break;
            }
        }
    }

    private void showSetupView() {
        System.out.println("\n=== NEXA AI ===");
        System.out.println("Sistema Operativo Inteligente");
        System.out.println("1. Iniciar sesión");
        System.out.println("2. Salir");
        System.out.print("Seleccione una opción: ");

        int option = scanner.nextInt();
        scanner.nextLine(); // Consume newline

        if (option == 1) {
            currentView = View.AUTH;
        } else if (option == 2) {
            System.exit(0);
        }
    }

    private void showAuthView() {
        System.out.println("\n=== Inicio de Sesión ===");
        System.out.print("Email: ");
        String email = scanner.nextLine();
        System.out.print("Contraseña: ");
        String password = scanner.nextLine();

        handleSignIn(email, password);
    }

    private void handleSignIn(String email, String password) {
        loading = true;
        error = "";

        try {
            // Simulate network delay
            Thread.sleep(1500);
            
            user = new User("user-123", email, email.split("@")[0]);
            currentView = View.CHAT;
            loading = false;
            
            // Add welcome message
            messages.add(new Message("assistant", "Hola, soy NEXA AI. ¿En qué puedo ayudarte hoy?"));
        } catch (Exception e) {
            error = "Error al iniciar sesión";
            loading = false;
        }
    }

    private void showChatView() {
        System.out.println("\n=== NEXA Chat ===");
        System.out.println("Usuario: " + user.name);
        
        // Display messages
        for (Message msg : messages) {
            System.out.printf("[%s] %s\n", msg.role.toUpperCase(), msg.content);
        }

        System.out.println("\n1. Enviar mensaje");
        System.out.println("2. Cerrar sesión");
        System.out.print("Seleccione una opción: ");

        int option = scanner.nextInt();
        scanner.nextLine(); // Consume newline

        if (option == 1) {
            System.out.print("Escribe tu mensaje: ");
            String input = scanner.nextLine();
            
            messages.add(new Message("user", input));
            
            // Simulate AI response
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            
            messages.add(new Message("assistant", "He recibido tu mensaje. ¿En qué más puedo ayudarte?"));
        } else if (option == 2) {
            user = null;
            messages.clear();
            currentView = View.SETUP;
        }
    }

    public static void main(String[] args) {
        NexaAI nexaAI = new NexaAI();
        nexaAI.start();
    }
}