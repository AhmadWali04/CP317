package backend;
import java.util.ArrayList;

//should also implement the location class
public class Restaurant{
    private int id;
    private String name;
    private ArrayList<String> typesOfFood;

    public Restaurant(int id, String name,ArrayList<String> typesOfFoods){
        this.id = id;
        this.name = name;
        this.typesOfFood = typesOfFoods;
    }

    public Restaurant(int id, String name) {
        this(id,name, new ArrayList<>());
    }

    //setter methods
    public void setName(String Name){
        this.name = name;
    }

    public void setId(int ID){
        this.id = id;
    }

 
    //getter methods
    public String getName(){
        return this.name;
    }

    public int getId(){
        return this.id;
    }

    public ArrayList<String> getTypesOfFoods(){
        return this.typesOfFood; 
    }

}
