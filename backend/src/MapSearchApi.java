import java.io.*; //for handling input/output
import java.net.HttpURLConnection; //for making HTTP requests
import java.net.URL; //for handling URLs
import java.util.Random;
import com.google.gson.Gson;
import org.json.JSONObject;
import org.json.JSONArray;

public class MapSearchApi {
    private static final String key = "AIzaSyDGYZDBalEh2oeJP6SnU6mffWQNj4FPDt0";
    static double x = 43.24; //latitude
    static double y = -79.89; //longitude
    static long rad = 5000; //radius
    static String filter = "\"chinese_restaurant\",\"korean_restaurant\"";

    public static void main(String[] args) {
        Location userLocation = StoredLocationFetch();
        if (userLocation == null) { // error: could not get user location from localServer
            System.out.println("Location data not available");
            return;
        }
        double latitude = userLocation.getLatitude();
        double longitude = userLocation.getLongitude();
        System.out.println("location retreived: latitude= " + latitude + ",longitude= " + longitude);
        String response = search(latitude, longitude);
        //print returned json file converted into a string
        if (response != null) {
            parseRandom(response); // parsing method
        } else {
            System.out.println("API returned no results");
        }
        // System.out.println("Api Response:\n" + response);
    }

    //get the stored location data from Location.java
    //currently works by looking at LocalServer via local TomCat server installation
    public static Location StoredLocationFetch() {
        try {
            URL url = new URL("http://localhost:8080/restaurantProject/getLocation");//where the POST is on localserver to get location data
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();

            Gson gson = new Gson();
            return gson.fromJson(response.toString(), Location.class);
        } catch (Exception e) {
            e.printStackTrace();;
            return null;
        }
    }

    /*
    *  grabs raw restaurant info from google maps api, using json.
    */
    public static String search(double lat, double lon) {
        try {
            // url for google places api
            URL url = new URL("https://places.googleapis.com/v1/places:searchNearby");

            // for creating a HTTP connection
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json"); // this specifies were sending json data
            conn.setRequestProperty("X-Goog-Api-Key", key);
            conn.setRequestProperty("X-Goog-FieldMask",
                    "places.displayName,places.id,places.shortFormattedAddress,places.types,places.rating");

            String jsonBody = "{"
                    + "\"includedTypes\": [" + filter + "]," // search for restaurants
                    + "\"locationRestriction\": {"
                    + "  \"circle\": {"
                    + "    \"center\": { \"latitude\": " + lat + ", \"longitude\": " + lon + " }," // use provided
                                                                                                   // lat/lon
                    + "    \"radius\": " + rad + "" // search within radius
                    + "  }"
                    + "}}";

            conn.setDoOutput(true); // allows sending data in the request
            try (OutputStream os = conn.getOutputStream()) { // open a stream to send json body
                os.write(jsonBody.getBytes("utf-8")); // convert json to bites and send
            }

            // reader to get response from google
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            StringBuilder response = new StringBuilder();
            String line;
            //read response line by line
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            //convert response to string to print
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    public static void parseRandom(String jsonResponse) {
        try {
            JSONObject json = new JSONObject(jsonResponse);
            JSONArray places = json.optJSONArray("places");
            if (places != null && places.length() > 0) {
                Random rand = new Random();
                JSONObject selected = places.getJSONObject(rand.nextInt(places.length())); // picks a random index from
                                                                                           // the places array and gets
                                                                                           // theat specific jsonobject
                                                                                           // (restaurant)
                String name = selected.optJSONObject("displayName").optString("text", "Unknown"); // get the display
                                                                                                  // name object then
                                                                                                  // get the "text"
                                                                                                  // inside it
                // if it doesnt exist, it sets defaultValue: to unknown
                String address = selected.optString("shortFormattedAddress", "No Address Available"); // get
                                                                                                      // shortFormattedAddress
                                                                                                      // field, default
                                                                                                      // to no provided
                                                                                                      // address
                String placeId = selected.optString("id", "No ID"); // no id available should NOT EVER, AT ALL, happen
                                                                    // but just incase
                double rating = selected.has("rating") ? selected.getDouble("rating") : -1; // check if rating field
                                                                                            // exists: if yes: get it as
                                                                                            // double, if not set -1
                System.out.println("Randomly Selected Restaurant: ");
                System.out.println("Name: " + name);
                System.out.println("Address: " + address);
                System.out.println("Place ID:" + placeId);
                System.out.println("Rating: " + (rating != -1 ? rating : "N/A"));
            } else {
                System.out.println("No restaurants found fitting description.");
            }
        } catch (Exception e) {
            System.out.println("Error while parsing JSON:");
            e.printStackTrace(); // Print full stack trace for debugging
        }
    }
}
