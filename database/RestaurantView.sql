CREATE VIEW restaurant_view AS
SELECT 
    restaurantID, 
    name AS restaurant_name, 
    typeID 
FROM restaurants;