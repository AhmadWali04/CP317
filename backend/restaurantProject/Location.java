public class Location {
    //location object that will pass off the person/Resturaunts longitute and lattitude to the user object
    //should return those values through some sort of online call to check their coordinates (maybe google maps?)

    /*
     * Creating our characteristics of the location class
     */
    private double longitude;
    private double latitude;

    //default constructor
    public Location() {}
    /*
     * The creation of the location object
     */
    public Location(double latitude,double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    //getter methods:
    public double getLatitude(){
        return latitude;
    }
    public double getLongitude(){
        return longitude;
    }
    //setter methods:
    private void setLatitude(double latitude){
        this.latitude = latitude;
    }
    private void setLongitude(double longitude){
        this.longitude = longitude;
    }
    //NEED TO DO: create a retreival method that gets their location from their phone or sumn.
     
}
