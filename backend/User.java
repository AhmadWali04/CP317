package backend;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class User{

    /*
     * CREATING THE OBJECT CHARACTERISTICS
     * Contributed By: Ahmad W
     */
    private int id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    //super the location somehow
    private ArrayList<String> favourites;
    private String searchHistory[]; //use an array because lets not store more than like 5 searches
    private Map<String,Object> preferences;

    /*
     * INITIALIZING THE OBJECT
     * Contributed By: Ahmad W
     */

    public User(int id, String firstName, String lastName, String email, String password, float radius,String[] searchHistory){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.searchHistory = searchHistory;
        //creating the hashmap object:
        this.preferences = new HashMap<>();
        this.preferences.put("Price Range", null);
        this.preferences.put("Radius: ", radius);
        this.preferences.put("Cuisine: ", null);
    }

        //Overload Constructor for the User Database
        public User(int id, String firstName, String lastName, String email, String password) {
            this(id, firstName, lastName, email, password, 0.0f, new String[0]); // default values
        }
    
    
    //action methods:

     void removeFavourites(String resturantName, ArrayList<String> favourites){
        //loop through the list, if we find where it is we remove it
        for(int i = 0; i<= favourites.size(); i++){
            if(favourites.get(i).equals(resturantName)){
                favourites.remove(i);
            }
        }
        return;
     }

     public void addToFavourites(String resturantName, ArrayList <String> favourites){
        if(!(favourites.contains(resturantName))){
            favourites.add(resturantName);
        }
        return;
     }

     public String[] updateSearchHistory(String[] searchHistory){
        //move all elements down 1, make hte last element null
        for(int i = 0; i < searchHistory.length - 1; i++){
            searchHistory[i-1] = searchHistory[i];
        }
        searchHistory[0] = " ";
        return searchHistory;
     }
     
     public void addToSearchHistory(String restaurantName, String[] searchHistory) {
        //take the users search history and pass it to a a method to decrement stuff
        updateSearchHistory(searchHistory);
        this.searchHistory[0] = (restaurantName);
    }

    public String[] viewSearchHistory() {
        return this.searchHistory;
    }

    public String[] clearSearchHistory() {
        for(int i = 0; i <=5; i++){
            this.searchHistory[i] = null;
        }
        return this.searchHistory;
    }


     public void updatePreferences(String priceRange, String radius, List<String> cuisine) {
        if (priceRange != null) {
            this.preferences.put("price_range", priceRange);
        }
        if (radius != null) {
            this.preferences.put("radius", radius);
        }
        if (cuisine != null) {
            this.preferences.put("cuisine", cuisine);
        }
    }


    //getter methods:
    public int getId(){
        return this.id;
    }

    public String getEmail(){
        return this.email;
    }

    public String getPassword(){
        return this.password;
    }
    
    public String getFirstName(){
        return this.firstName;
    }

    public String getLastName(){
        return this.lastName;
    }

    public List<String> getFavourites(){
        return this.favourites;
    }

    public Map<String, Object> getPreferences() {
        return this.preferences;
    }
    
    //setter methods:
    public void setID(int id){
        this.id = id;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public void setPassword(String password){
        this.password = password;
    }
    public void setFirstName(String firstName){
        this.firstName = firstName;
    }

    public void setLastName(String lastName){
        this.lastName = lastName;
    }
}
