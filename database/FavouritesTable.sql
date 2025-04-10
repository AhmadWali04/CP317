CREATE TABLE favourites (
    userID INT NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (userID, restaurant_name),
    FOREIGN KEY (userID) REFERENCES users(id),
    FOREIGN KEY (restaurant_name) REFERENCES restaurants(name)
);


