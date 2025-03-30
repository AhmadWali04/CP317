<?php
include 'config.php';  

// Check if the form was submitted (you can modify this to use an API or Ajax as well)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the user ID and restaurant name from the form or POST data
    $userID = $_POST["userID"];
    $restaurant_name = $_POST["restaurant_name"];

    // Validate inputs
    if (empty($userID) || empty($restaurant_name)) {
        die("User ID and Restaurant Name are required.");
    }

    // Check if the restaurant exists in the restaurants table
    $stmt = $conn->prepare("SELECT restaurantID FROM restaurants WHERE name = ?");
    $stmt->bind_param("s", $restaurant_name);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        die("The specified restaurant does not exist.");
    }

    // Insert the restaurant into the history table
    $stmt = $conn->prepare("INSERT INTO history (userID, restaurant_name) VALUES (?, ?)");
    $stmt->bind_param("is", $userID, $restaurant_name);

    if ($stmt->execute()) {
        echo "Restaurant visit added to history successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>