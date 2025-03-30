<?php
include 'config.php';  

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the user ID and restaurant name from the form
    $userID = $_POST["userID"];
    $restaurant_name = $_POST["restaurant_name"];

    // Validate the inputs
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

    // Insert the restaurant into the favourites table
    $stmt = $conn->prepare("INSERT INTO favourites (userID, restaurant_name) VALUES (?, ?)");
    $stmt->bind_param("is", $userID, $restaurant_name);

    if ($stmt->execute()) {
        echo "Restaurant added to favorites successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>