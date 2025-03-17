import java.io.BufferedReader;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.tools.DocumentationTool.Location;

import com.google.gson.Gson;

 /*
  * How it works:
  * user clicks "Scan location" (geolocator.html) and we get their location as a JSON file to pass it to the
  * Local server (here), where we unencrypt it into a GSON file so java can read it and pass it to the
  * Location class.
  */
  
  /*
   * NEXT STEPS:
   * store the location of the users in the database, 
   * resturantsNearMe should take the info from the database and serach for resturaunts
   * by usingthe user preferences
   */

   public class LocalServer extends HttpServlet{
    private static final long serialVersionUID = 1L;
    protected void post(HttpServletRequest request, HttpServletResponse HttpServletResponse) throws ServletException, IOException{
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String Line;
        while(Line = reader.readLine() != null){
            sb.append((Line));
            String jsonData = sb.toString();
            Gson gson = new Gson();
            Location location = gson.fromJson(jsonData,Location.class);
        }
    }
   }
