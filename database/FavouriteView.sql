CREATE VIEW favourite_view AS
SELECT 
    f.userID,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    f.restaurant_name,
    r.typeID AS restaurant_type
FROM favourites f
JOIN users u ON f.userID = u.id
JOIN restaurants r ON f.restaurant_name = r.name;