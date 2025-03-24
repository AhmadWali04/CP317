// Update displayed price when slider moves
function updatePrice() {
    let minPrice = parseInt(document.getElementById("priceMin").value);
    let maxPrice = parseInt(document.getElementById("priceMax").value);
    if (minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
    document.getElementById("priceMinValue").innerText = minPrice;
    document.getElementById("priceMaxValue").innerText = maxPrice;
    filterRestaurants();
}

// Update displayed distance when slider moves
function updateDistance() {
    document.getElementById("distanceValue").innerText = document.getElementById("distance").value;
    filterRestaurants();
}

// Update displayed rating when slider moves
function updateRating() {
    document.getElementById("ratingValue").innerText = document.getElementById("rating").value;
    filterRestaurants();
}

// Function to get selected cuisines from checkboxes
function getSelectedCuisines() {
    let checkboxes = document.querySelectorAll("#cuisine-options input[type='checkbox']:checked");
    return Array.from(checkboxes).map(cb => cb.value);
}

// Function to filter restaurants based on user selections
function filterRestaurants() {
    let minPrice = parseInt(document.getElementById("priceMin").value);
    let maxPrice = parseInt(document.getElementById("priceMax").value);
    let maxDistance = parseInt(document.getElementById("distance").value);
    let minRating = parseFloat(document.getElementById("rating").value);
    let selectedCuisines = getSelectedCuisines();

    let restaurants = document.querySelectorAll("#restaurants li");

    restaurants.forEach(restaurant => {
        let restaurantPrice = parseInt(restaurant.getAttribute("data-price"));
        let restaurantCuisine = restaurant.getAttribute("data-cuisine");
        let restaurantDistance = parseInt(restaurant.getAttribute("data-distance"));
        let restaurantRating = parseFloat(restaurant.getAttribute("data-rating"));

        let matchesFilters =
            (restaurantPrice >= minPrice && restaurantPrice <= maxPrice) &&
            (restaurantDistance <= maxDistance) &&
            (restaurantRating >= minRating) &&
            (selectedCuisines.length === 0 || selectedCuisines.includes(restaurantCuisine));

        restaurant.style.display = matchesFilters ? "block" : "none";
    });
}
