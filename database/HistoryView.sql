CREATE VIEW history_view AS
SELECT 
    h.userID,
    u.first_name AS user_first_name,
    u.last_name AS user_last_name,
    h.restaurant_name,
    r.typeID AS restaurant_type
FROM history h
JOIN users u ON h.userID = u.id
JOIN restaurants r ON h.restaurant_name = r.name;