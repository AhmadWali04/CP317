package database;
import backend.User;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserDatabase extends User {
    private int userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String userPassword;

    // Constructor to copy our user object information
    public UserDatabase(int id, String firstName, String lastName, String email, String password) {
        super(id, firstName, lastName, email, password);
        super.setID(id);
        super.setPassword(password);
        super.setFirstName(firstName);
        super.setLastName(lastName);
        super.setEmail(email);
    }

    // Save user to the database
    public void saveToDatabase() {
        /*
         * AKASH DO THE NEXT 4 LINES WITH YOUR STUFF
         */
        String url = "jdbc:mysql://localhost:3306/restaurantfinder"; // Replace with your database URL
        String dbUsername = "root"; // Replace with your database username
        String dbPassword = "Bhagtana2311!"; // Replace with your database password
        String insertQuery = "INSERT INTO users (user_id, fistName, lastName, email, password, visitID) VALUES (?, ?, ?)";

        try (Connection connection = DriverManager.getConnection(url, dbUsername, dbPassword);
             PreparedStatement statement = connection.prepareStatement(insertQuery)) {
                
            // Set parameters for the query
            statement.setInt(1, this.getId());
            statement.setString(2,this.getFirstName());
            statement.setString(2,this.getLastName());
            statement.setString(2,this.getEmail());
            statement.setString(3, this.getPassword());

            // Execute the query
            int rowsInserted = statement.executeUpdate();
            if (rowsInserted > 0) {
                System.out.println("User " + this.getId() + " was successfully saved to the database.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
