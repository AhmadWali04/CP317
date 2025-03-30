<?php
include 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST["name"]);
    $typeID = intval($_POST["typeID"]);

    if (empty($name) || empty($typeID)) {
        die("Both name and typeID are required.");
    }

    $stmt = $conn->prepare("INSERT INTO restaurants (name, typeID) VALUES (?, ?)");
    $stmt->bind_param("si", $name, $typeID);

    if ($stmt->execute()) {
        echo "Restaurant added successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>