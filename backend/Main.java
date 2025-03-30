package backend;
import org.eclipse.jetty.server.Server; // Add this import
import org.eclipse.jetty.servlet.ServletContextHandler;

public class Main {
    public static void main(String[] args) {
        // Step 1: Create a server instance
        Server server = new Server(8080); // Port 8080

        // Step 2: Set up a servlet context handler
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/"); // Root context
        server.setHandler(context);

        context.addServlet(RestaurantSearchServlet.class, "/search");

        try {
            server.start();
            System.out.println("Server started on http://localhost:8080");
            server.join();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}