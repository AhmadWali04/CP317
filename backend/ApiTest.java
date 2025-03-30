package backend;
import java.io.*; //for handling input/output
import java.net.HttpURLConnection; //for making HTTP requests
import java.net.URL; //for handling URLs

public class ApiTest {
    private static final String key = "AIzaSyDGYZDBalEh2oeJP6SnU6mffWQNj4FPDt0";
    static double x = 43.24; //latitude
    static double y = -79.89; //longitude
    static long rad = 5000; //radius

    public static void main(String[] args) {
        String response = search(x, y);
        //print returned json file converted into a string
        System.out.println(response);
    }

    /*
    *  grabs raw restaurant info from google maps api, using json.
    */
    public static String search(double lat, double lon) {
        try {
            // this will be the URL we will send the post to
            String urlString = "https://places.googleapis.com/v1/places:searchNearby";
            URL url = new URL(urlString);

            // for creating a HTTP connection
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json"); // this specifies were sending json data
            conn.setRequestProperty("X-Goog-Api-Key", key);
            conn.setRequestProperty("X-Goog-FieldMask", "places.displayName,places.id");

            String jsonBody = "{"
                    + "\"includedTypes\": [\"restaurant\"]," // search for restaurants
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
}
