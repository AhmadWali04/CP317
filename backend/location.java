package Backend;

public class location {
    //location object that will pass off the person/Resturaunts longitute and lattitude to the user object
    //should return those values through some sort of online call to check their coordinates (maybe google maps?)

    /*
     * Creating our characteristics of the location class
     */
    private float longitude;
    private float lattitude;
    private float[] location;

    /*
     * The creation of the location object
     */
    public location(float longitude,float lattitude,float[] location){
        this.longitude = longitude;
        this.lattitude = lattitude;
        this.location = location;
    }

    //getter methods:
    public float getLattitude(){
        return this.lattitude;
    }
    public float getLongitutde(){
        return this.longitude;
    }
    
    public float[] getLocation(){
        return this.location;
    }

    //setter methods:
    private void setLattitude(float lattitude){
        this.lattitude = lattitude;
    }
    private void setLongittude(){
        this.longitude = longitude;
    }

    private void setLocation(){
        this.location = new float[]{longitude,lattitude};
    }
    //NEED TO DO: create a retreival method that gets their location from their phone or sumn.
     
}
