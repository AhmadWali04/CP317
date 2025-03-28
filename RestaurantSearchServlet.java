package backend;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import com.google.gson.Gson;

/**
 * Servlet implementation class RestaurantSearchServlet
 * Handles restaurant search requests from the frontend
 */
@WebServlet(urlPatterns = {"/search", "/searchByAddress"})
public class RestaurantSearchServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    // CORS headers setup
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }
    
    /**
     * Handle POST requests for restaurant searches
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Set CORS headers for the response
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        // Set response content type
        response.setContentType("application/json");
        
        try {
            // Read request body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            
            // Parse JSON request
            String jsonData = sb.toString();
            JSONObject requestData = new JSONObject(jsonData);
            
            // Determine the type of request (by coordinates or by address)
            String servletPath = request.getServletPath();
            JSONObject restaurant;
            
            if ("/search".equals(servletPath)) {
                // Search by coordinates
                double latitude = requestData.getDouble("latitude");
                double longitude = requestData.getDouble("longitude");
                JSONObject filters = requestData.optJSONObject("filters");
                
                restaurant = findRestaurantByCoordinates(latitude, longitude, filters);
            } else {
                // Search by address
                String address = requestData.getString("address");
                JSONObject filters = requestData.optJSONObject("filters");
                
                restaurant = findRestaurantByAddress(address, filters);
            }
            
            // Send response
            PrintWriter out = response.getWriter();
            out.print(restaurant.toString());
            out.flush();
            
        } catch (Exception e) {
            // Log error
            e.printStackTrace();
            
            // Return error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("error", e.getMessage());
            
            PrintWriter out = response.getWriter();
            out.print(errorResponse.toString());
            out.flush();
        }
    }
    
    /**
     * Find a restaurant using coordinates
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @param filters Optional filter criteria
     * @return JSONObject with restaurant data
     */
    private JSONObject findRestaurantByCoordinates(double latitude, double longitude, JSONObject filters) {
        try {
            // Prepare filter parameters for the MapSearchApi
            String filterString = prepareFilters(filters);
            
            // Get restaurant data from the MapSearchApi
            String searchResponse = MapSearchApi.search(latitude, longitude);
            
            // Parse the response and select a random restaurant
            return parseAndSelectRandomRestaurant(searchResponse);
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error finding restaurant by coordinates: " + e.getMessage());
        }
    }
    
    /**
     * Find a restaurant using an address
     * @param address Address string
     * @param filters Optional filter criteria
     * @return JSONObject with restaurant data
     */
    private JSONObject findRestaurantByAddress(String address, JSONObject filters) {
        try {
            // Use MapSearchApi to convert address to coordinates
            double[] coordinates = MapSearchApi.AddressToCoords(address);
            
            if (coordinates == null) {
                throw new RuntimeException("Unable to geocode the provided address");
            }
            
            // Now search with the coordinates
            return findRestaurantByCoordinates(coordinates[0], coordinates[1], filters);
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error finding restaurant by address: " + e.getMessage());
        }
    }
    
    /**
     * Parse the API response and select a random restaurant
     * @param apiResponse Response from MapSearchApi
     * @return JSONObject with the selected restaurant
     */
    private JSONObject parseAndSelectRandomRestaurant(String apiResponse) {
        try {
            // Parse the Places API response
            JSONObject json = new JSONObject(apiResponse);
            JSONArray places = json.optJSONArray("places");
            
            if (places == null || places.length() == 0) {
                throw new RuntimeException("No restaurants found matching the criteria");
            }
            
            // Select a random restaurant from the results
            int randomIndex = (int) (Math.random() * places.length());
            JSONObject selectedPlace = places.getJSONObject(randomIndex);
            
            // Format the response for the frontend
            JSONObject result = new JSONObject();
            
            // Extract display name
            if (selectedPlace.has("displayName") && selectedPlace.getJSONObject("displayName").has("text")) {
                result.put("name", selectedPlace.getJSONObject("displayName").getString("text"));
            } else {
                result.put("name", "Unknown Restaurant");
            }
            
            // Extract address
            if (selectedPlace.has("shortFormattedAddress")) {
                result.put("address", selectedPlace.getString("shortFormattedAddress"));
            } else {
                result.put("address", "Address not available");
            }
            
            // Extract cuisine type (from types array, if available)
            if (selectedPlace.has("types") && selectedPlace.getJSONArray("types").length() > 0) {
                String type = selectedPlace.getJSONArray("types").getString(0);
                // Format the type (e.g., convert "japanese_restaurant" to "Japanese")
                String cuisine = formatCuisineType(type);
                result.put("cuisine", cuisine);
            } else {
                result.put("cuisine", "Various");
            }
            
            // Extract rating
            if (selectedPlace.has("rating")) {
                result.put("rating", selectedPlace.getDouble("rating"));
            } else {
                // Default value if rating not available
                result.put("rating", 4.0);
            }
            
            // Set default price level if not available
            result.put("priceLevel", 2); // Medium price range default
            
            // Add place ID for potential future use
            if (selectedPlace.has("id")) {
                result.put("id", selectedPlace.getString("id"));
            }
            
            return result;
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error parsing API response: " + e.getMessage());
        }
    }
    
    /**
     * Format the cuisine type from the Google Places type
     * @param type Google Places API type
     * @return Formatted cuisine name
     */
    private String formatCuisineType(String type) {
        // Remove "_restaurant" suffix if present
        String cuisine = type.replace("_restaurant", "");
        
        // Capitalize first letter
        if (cuisine.length() > 0) {
            cuisine = cuisine.substring(0, 1).toUpperCase() + cuisine.substring(1);
        }
        
        // Replace underscores with spaces
        cuisine = cuisine.replace("_", " ");
        
        return cuisine;
    }
    
    /**
     * Prepare filter string for MapSearchApi
     * @param filters JSONObject with filter criteria
     * @return Filter string
     */
    private String prepareFilters(JSONObject filters) {
        if (filters == null) {
            return "\"restaurant\""; // Default to any restaurant
        }
        
        StringBuilder filterBuilder = new StringBuilder();
        
        // Handle cuisine types
        if (filters.has("cuisineTypes")) {
            JSONArray cuisines = filters.getJSONArray("cuisineTypes");
            
            for (int i = 0; i < cuisines.length(); i++) {
                String cuisine = cuisines.getString(i).toLowerCase();
                
                if (i > 0) {
                    filterBuilder.append(",");
                }
                
                // Format cuisine for the API
                filterBuilder.append("\"").append(cuisine).append("_restaurant\"");
            }
        } else {
            // Default to restaurant if no cuisine specified
            filterBuilder.append("\"restaurant\"");
        }
        
        return filterBuilder.toString();
    }
}