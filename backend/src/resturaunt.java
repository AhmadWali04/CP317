package Backend;

import java.util.ArrayList;
import java.util.List;

//should also implement the location class
public class resturaunt{
    private int id;
    private String name;
    private List<String> typesOfFood;
    private float maxPrice;


    public resturaunt(int id, String name,List<String> typesOfFoods){
        this.id = id;
        this.name = name;
        this.typesOfFood = typesOfFoods;
    }

    //action methods
    public List<Strings> addTypesofFoods(){

    }

    public List<Strings> removeTypesofFoods(){

    }

    //setter methods
    public void setName(String Name){
        this.name = name;
    }

    public void setId(int ID){
        this.id = id;
    }

    public void setMaxPrice(float price){
        this.maxPrice = price;
    }

    //getter methods
    public String getName(){
        return this.name;
    }

    public int getId(){
        return this.id;
    }

    public List<String> getTypesOfFoods(){
        return this.typesOfFood; 
    }

    public float getMaxPrice(){
        return this.maxPrice;
    }


    
}
