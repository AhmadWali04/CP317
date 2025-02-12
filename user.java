class User:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.preferences = {"price_range": None, "radius": None, "cuisine": []}
        self.location = None
        self.search_history = []
        self.favorites = []
    
    def update_preferences(self, price_range=None, radius=None, cuisine=None):
        if price_range:
            self.preferences["price_range"] = price_range
        if radius:
            self.preferences["radius"] = radius
        if cuisine:
            self.preferences["cuisine"] = cuisine

    def set_location(self, latitude, longitude):
        self.location = (latitude, longitude)
    
    def get_preferences(self):
        return self.preferences

    def add_to_search_history(self, restaurant_name, date):
        self.search_history.append({"restaurant": restaurant_name, "date": date})
    
    def view_search_history(self):
        return self.search_history

    def clear_search_history(self):
        self.search_history = []

    def save_favorite_restaurants(self, restaurant_name):
        if restaurant_name not in self.favorites:
            self.favorites.append(restaurant_name)
    
    def get_favorites(self):
        return self.favorites
