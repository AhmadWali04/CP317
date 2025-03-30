// Restaurant finder implementation using real API with array response support

document.addEventListener('DOMContentLoaded', function() {
    const findRestaurantBtn = document.querySelector('.search-container .btn-primary');
    if (findRestaurantBtn) {
        findRestaurantBtn.addEventListener('click', findRandomRestaurant);
    }

    function findRandomRestaurant() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            if (confirm('Please log in or sign up to use this feature. Would you like to go to the login page?')) {
                window.location.href = 'login.html';
            }
            return;
        }

        const locationInput = document.querySelector('.location-input');
        if (!locationInput || locationInput.value.trim() === '') {
            alert('Please enter your location');
            locationInput.focus();
            return;
        }

        const location = locationInput.value.trim();
        const filters = collectFilters();

        console.log('Search parameters:', { location, filters });

        showLoadingState();

        fetchRestaurantFromAPI(location, filters)
            .then(restaurant => {
                if (restaurant) {
                    displayRestaurant(restaurant);
                    
                    // Save to search history if logged in
                    if (currentUser) {
                        saveToSearchHistory(restaurant);
                    }
                } else {
                    showError("No matching restaurants found.");
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                showError("Something went wrong. Please try again.");
            });
    }

    async function fetchRestaurantFromAPI(location, filters) {
        try {
            const apiResponse = await fetch("http://localhost:8080/restaurantProject/findRestaurant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ location, filters })
            }).then(res => {
                if (!res.ok) throw new Error("Backend error");
                return res.json();
            });

            console.log("API Response from backend:", apiResponse);

            if (Array.isArray(apiResponse) && apiResponse.length >= 5) {
                return {
                    name: apiResponse[0],
                    address: apiResponse[1],
                    cuisine: filters.cuisineType || "Various",
                    rating: apiResponse[3] || 4.0,
                    price: apiResponse[4] || 2
                };
            }

            if (apiResponse.name) {
                return {
                    name: apiResponse.name,
                    address: apiResponse.address,
                    cuisine: apiResponse.cuisine || "Various",
                    price: apiResponse.price || 2,
                    rating: apiResponse.rating || 4.0
                };
            }

            return null;
        } catch (error) {
            console.error("Error in fetchRestaurantFromAPI:", error);
            showError("Error talking to backend API");
            return null;
        }
    }

    function collectFilters() {
        const filters = {
            cuisineType: null,
            priceLevel: null,
            distance: null,
            rating: null
        };

        const filterElements = document.querySelectorAll('.filter');
        filterElements.forEach(filter => {
            const filterText = filter.textContent.trim();
            console.log("Processing filter:", filterText);

            if (filterText.includes('Cuisine:')) {
                filters.cuisineType = filterText.split('Cuisine:')[1].trim();
                console.log("- Cuisine detected:", filters.cuisineType);
            } else if (filterText.includes('Price:')) {
                filters.priceLevel = (filterText.split('Price:')[1].match(/\$/g) || []).length;
                console.log("- Price detected:", filters.priceLevel, "($)");
            } else if (filterText.includes('Distance:')) {
                const distanceText = filterText.split('Distance:')[1].trim();
                filters.distance = parseDistanceToMeters(distanceText);
                console.log("- Distance detected:", distanceText, "->", filters.distance, "meters");
            } else if (filterText.includes('Rating:')) {
                const ratingText = filterText.split('Rating:')[1].trim();
                filters.rating = parseRating(ratingText);
                console.log("- Rating detected:", ratingText, "->", filters.rating, "stars");
            }
        });

        const userData = JSON.parse(localStorage.getItem('currentUser'));
        if (userData && userData.preferences) {
            if (!filters.cuisineType && userData.preferences.cuisines?.length > 0) {
                filters.cuisinesToInclude = userData.preferences.cuisines;
            }
            if (!filters.priceLevel && userData.preferences.priceLevel?.length > 0) {
                filters.priceLevelArray = userData.preferences.priceLevel;
            }
            if (!filters.distance && userData.preferences.radius) {
                filters.distance = parseInt(userData.preferences.radius) * 1000; // Convert km to meters
            }
            if (!filters.rating && userData.preferences.minRating) {
                filters.rating = parseFloat(userData.preferences.minRating);
            }
        }

        return filters;
    }

    function parseDistanceToMeters(distanceText) {
        const match = distanceText.match(/(\d+(?:\.\d+)?)/);
        // Convert km to meters
        return match ? parseFloat(match[1]) * 1000 : 5000;
    }

    function parseRating(ratingText) {
        console.log("Parsing rating text:", ratingText);
        
        // Count full stars (★)
        const fullStars = (ratingText.match(/★/g) || []).length;
        
        // Check for "& up" pattern (e.g., "★★★☆☆ & up")
        if (ratingText.includes('& up')) {
            console.log("- '& up' format detected, returning star count:", fullStars);
            return fullStars;
        }
        
        // If we have full stars, return that count
        if (fullStars > 0) {
            console.log("- Returning star count:", fullStars);
            return fullStars;
        }
        
        // Try to extract numeric value (e.g., "4.5")
        const numericMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
        if (numericMatch && numericMatch[1]) {
            const rating = parseFloat(numericMatch[1]);
            console.log("- Extracted numeric rating:", rating);
            return rating;
        }
        
        console.log("- No rating pattern matched, returning 0");
        return 0; // Default if no pattern matches
    }

    function showLoadingState() {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-utensils fa-spin"></i>
                    <p>Finding your perfect restaurant...</p>
                </div>
            `;
            const style = document.createElement('style');
            style.textContent = `
                #loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .loading-spinner {
                    background-color: white;
                    padding: 2rem;
                    border-radius: 10px;
                    text-align: center;
                }
                .loading-spinner i {
                    font-size: 3rem;
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }
                .fa-spin {
                    animation: fa-spin 2s infinite linear;
                }
                @keyframes fa-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
        }
    }

    function hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    function showError(message) {
        hideLoadingState();
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--danger-color);
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    function displayRestaurant(restaurant) {
        hideLoadingState();
        
        // Create a modal to display the restaurant
        const modal = document.createElement('div');
        modal.className = 'restaurant-modal';
        modal.innerHTML = `
            <div class="restaurant-card">
                <div class="restaurant-header">
                    <h2>Your Restaurant Match</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="restaurant-content">
                    <div class="restaurant-icon">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <h3>${restaurant.name}</h3>
                    <p class="restaurant-detail"><i class="fas fa-map-marker-alt"></i> ${restaurant.address}</p>
                    <p class="restaurant-detail"><i class="fas fa-utensils"></i> ${restaurant.cuisine}</p>
                    <p class="restaurant-detail"><i class="fas fa-star"></i> ${restaurant.rating.toFixed(1)} / 5</p>
                    <p class="restaurant-detail"><i class="fas fa-dollar-sign"></i> ${'$'.repeat(restaurant.price)}</p>
                    <div class="restaurant-actions">
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address)}" 
                           target="_blank" class="btn btn-primary"><i class="fas fa-directions"></i> Get Directions</a>
                        <button class="btn btn-secondary try-again"><i class="fas fa-redo"></i> Try Again</button>
                    </div>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .restaurant-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .restaurant-card {
                background-color: white;
                border-radius: 10px;
                overflow: hidden;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            }
            .restaurant-header {
                background-color: var(--primary-color);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .restaurant-header h2 {
                margin: 0;
            }
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
            }
            .restaurant-content {
                padding: 2rem;
                text-align: center;
            }
            .restaurant-icon {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: var(--light-color);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            }
            .restaurant-icon i {
                font-size: 2.5rem;
                color: var(--primary-color);
            }
            .restaurant-content h3 {
                margin-bottom: 1.5rem;
                font-size: 1.8rem;
            }
            .restaurant-detail {
                margin-bottom: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .restaurant-detail i {
                margin-right: 0.5rem;
                color: var(--gray-color);
                min-width: 20px;
            }
            .restaurant-actions {
                margin-top: 2rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            @media (max-width: 576px) {
                .restaurant-actions {
                    flex-direction: column;
                }
                .restaurant-actions .btn {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const tryAgainBtn = modal.querySelector('.try-again');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        tryAgainBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            findRandomRestaurant();
        });
    }
    
    // Function to save restaurant to search history
    function saveToSearchHistory(restaurant) {
        try {
            // Get current user data
            const userData = JSON.parse(localStorage.getItem('currentUser'));
            
            // Initialize search history if it doesn't exist
            if (!userData.searchHistory) {
                userData.searchHistory = [];
            }
            
            // Add timestamp to restaurant data
            const historyItem = {
                ...restaurant,
                timestamp: new Date().toISOString()
            };
            
            // Add to beginning of history array (most recent first)
            userData.searchHistory.unshift(historyItem);
            
            // Limit history to 10 items
            if (userData.searchHistory.length > 10) {
                userData.searchHistory = userData.searchHistory.slice(0, 10);
            }
            
            // Save back to localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
        } catch (error) {
            console.error('Error saving to search history:', error);
        }
    }
});