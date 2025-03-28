// Add this to script.js or create a new file called restaurant-finder.js

document.addEventListener('DOMContentLoaded', function() {
    // Get the "Find A Restaurant" button
    const findRestaurantBtn = document.querySelector('.search-container .btn-primary');
    
    if (findRestaurantBtn) {
        findRestaurantBtn.addEventListener('click', findRandomRestaurant);
    }
    
    // Function to handle finding a random restaurant
    function findRandomRestaurant() {
        // Check if user is logged in
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            // Show modal or redirect to login page
            if (confirm('Please log in or sign up to use this feature. Would you like to go to the login page?')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // 1. Collect user's location
        const locationInput = document.querySelector('.location-input');
        if (!locationInput || locationInput.value.trim() === '') {
            alert('Please enter your location');
            locationInput.focus();
            return;
        }
        
        const location = locationInput.value.trim();
        
        // 2. Collect selected filters
        const filters = collectFilters();
        
        // 3. Show loading state
        showLoadingState();
        
        // 4. Call API to find restaurants
        searchRestaurants(location, filters)
            .then(restaurant => {
                // 5. Display the selected restaurant
                displayRestaurant(restaurant);
            })
            .catch(error => {
                console.error('Error finding restaurant:', error);
                hideLoadingState();
                showError('Unable to find a restaurant. Please try again.');
            });
    }
    
    // Collect all selected filters
    function collectFilters() {
        const filters = {
            cuisineType: null,
            priceRange: null,
            distance: null,
            rating: null
        };
        
        // Get cuisine filter
        const cuisineFilter = document.querySelector('.filter:nth-child(1)');
        if (cuisineFilter && cuisineFilter.textContent.includes('Cuisine:')) {
            filters.cuisineType = cuisineFilter.textContent.split('Cuisine:')[1].trim();
        }
        
        // Get price filter
        const priceFilter = document.querySelector('.filter:nth-child(2)');
        if (priceFilter && priceFilter.textContent.includes('Price:')) {
            filters.priceRange = priceFilter.textContent.split('Price:')[1].trim();
        }
        
        // Get distance filter
        const distanceFilter = document.querySelector('.filter:nth-child(3)');
        if (distanceFilter && distanceFilter.textContent.includes('Distance:')) {
            const distanceText = distanceFilter.textContent.split('Distance:')[1].trim();
            filters.distance = parseDistanceToMeters(distanceText);
        }
        
        // Get rating filter
        const ratingFilter = document.querySelector('.filter:nth-child(4)');
        if (ratingFilter && ratingFilter.textContent.includes('Rating:')) {
            const ratingText = ratingFilter.textContent.split('Rating:')[1].trim();
            filters.rating = parseRating(ratingText);
        }
        
        // Get user preferences if available
        const userData = JSON.parse(localStorage.getItem('currentUser'));
        if (userData && userData.preferences) {
            // Apply user preferences for any filters not explicitly set
            if (!filters.cuisineType && userData.preferences.cuisines) {
                filters.cuisinesToInclude = userData.preferences.cuisines;
            }
            
            if (!filters.priceRange && userData.preferences.priceRange) {
                filters.priceRangeArray = userData.preferences.priceRange;
            }
            
            if (!filters.distance && userData.preferences.radius) {
                filters.distance = parseInt(userData.preferences.radius) * 1609; // Convert miles to meters
            }
            
            if (!filters.rating && userData.preferences.minRating) {
                filters.rating = parseFloat(userData.preferences.minRating);
            }
        }
        
        return filters;
    }
    
    // Convert distance text to meters
    function parseDistanceToMeters(distanceText) {
        if (distanceText.includes('mile')) {
            const milesValue = parseFloat(distanceText);
            if (!isNaN(milesValue)) {
                return milesValue * 1609; // Convert miles to meters
            }
        }
        return 5000; // Default to 5km
    }
    
    // Parse rating text to numeric value
    function parseRating(ratingText) {
        // Count stars
        const starCount = (ratingText.match(/★/g) || []).length;
        if (starCount > 0) {
            return starCount;
        }
        
        // Try to parse "X & up" format
        if (ratingText.includes('& up')) {
            const starCountText = ratingText.split('&')[0].trim();
            const starCount = (starCountText.match(/★/g) || []).length;
            return starCount;
        }
        
        return 0; // Default to no rating filter
    }
    
    // Show loading state
    function showLoadingState() {
        // Create a loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-utensils fa-spin"></i>
                    <p>Finding your perfect restaurant...</p>
                </div>
            `;
            
            // Add styles
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
                    display: block;
                }
                .fa-spin {
                    animation: fa-spin 2s infinite linear;
                }
                @keyframes fa-spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        } else {
            document.getElementById('loading-overlay').style.display = 'flex';
        }
    }
    
    // Hide loading state
    function hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    // Show error message
    function showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        
        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .error-toast {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--danger-color);
                    color: white;
                    padding: 1rem;
                    border-radius: 4px;
                    z-index: 1000;
                    text-align: center;
                    max-width: 300px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                
                .success-toast {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--success-color);
                    color: white;
                    padding: 1rem;
                    border-radius: 4px;
                    z-index: 1000;
                    text-align: center;
                    max-width: 300px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 5000);
    }
    
    // Search for restaurants based on location and filters
    async function searchRestaurants(location, filters) {
        try {
            // In production, we would use the real API
            // For now we'll use a conditional approach that tries the API first
            // and falls back to mock data if the API is not available
            
            let result;
            
            try {
                // First attempt to use the real API (if available)
                if (typeof restaurantAPI !== 'undefined') {
                    const apiResponse = await restaurantAPI.findRandomRestaurant({
                        location,
                        filters
                    });
                    
                    if (apiResponse && apiResponse.name) {
                        // Format the API response to match our expected structure
                        result = {
                            name: apiResponse.name,
                            address: apiResponse.address || apiResponse.shortFormattedAddress,
                            cuisine: apiResponse.cuisine || apiResponse.types[0],
                            price: apiResponse.priceLevel || 2,
                            rating: apiResponse.rating || 4.0
                        };
                    }
                }
            } catch (apiError) {
                console.warn('API call failed, falling back to mock data', apiError);
                // We'll continue to the fallback in this case
            }
            
            // If API call wasn't successful, use mock data
            if (!result) {
                // Debug info
                console.log('Using mock data with filters:', {
                    location,
                    cuisine: filters.cuisineType || filters.cuisinesToInclude,
                    price: filters.priceRange || filters.priceRangeArray,
                    distance: filters.distance,
                    rating: filters.rating
                });
                
                // Get coordinates for debugging purposes
                let lat, lng;
                if (location.includes(',')) {
                    const coords = location.split(',');
                    lat = parseFloat(coords[0].trim());
                    lng = parseFloat(coords[1].trim());
                    console.log(`Coordinates parsed: ${lat}, ${lng}`);
                }
                
                // Use our mock data function
                result = getRandomRestaurant(filters);
            }
            
            return result;
        } catch (error) {
            console.error('Error in searchRestaurants:', error);
            throw error;
        }
    }
    
    // Return a random restaurant (mock function for demo)
    function getRandomRestaurant(filters) {
        const restaurants = [
            { 
                name: "Pasta Paradise", 
                address: "123 Italian Avenue, Toronto",
                cuisine: "Italian",
                price: 2,
                rating: 4.5
            },
            { 
                name: "Sushi Supreme", 
                address: "456 Japanese Lane, Toronto",
                cuisine: "Japanese",
                price: 3,
                rating: 4.7
            },
            { 
                name: "Taco Time", 
                address: "789 Mexican Road, Toronto",
                cuisine: "Mexican",
                price: 1,
                rating: 4.3
            },
            { 
                name: "Curry Corner", 
                address: "101 Indian Street, Toronto",
                cuisine: "Indian",
                price: 2,
                rating: 4.4
            },
            { 
                name: "Burger Bonanza", 
                address: "202 American Boulevard, Toronto",
                cuisine: "American",
                price: 2,
                rating: 4.2
            },
            { 
                name: "Pad Thai Palace", 
                address: "303 Thai Terrace, Toronto",
                cuisine: "Thai",
                price: 2,
                rating: 4.6
            },
            { 
                name: "Mediterranean Magic", 
                address: "404 Mediterranean Drive, Toronto",
                cuisine: "Mediterranean",
                price: 3,
                rating: 4.8
            },
            { 
                name: "Beijing Buffet", 
                address: "505 Chinese Circle, Toronto",
                cuisine: "Chinese",
                price: 1,
                rating: 4.1
            }
        ];
        
        // Filter restaurants based on user preferences
        let filtered = restaurants;
        
        // Filter by cuisine if specified
        if (filters.cuisineType) {
            filtered = filtered.filter(r => r.cuisine === filters.cuisineType);
        } else if (filters.cuisinesToInclude && filters.cuisinesToInclude.length > 0) {
            filtered = filtered.filter(r => filters.cuisinesToInclude.includes(r.cuisine.toLowerCase()));
        }
        
        // Filter by price if specified
        if (filters.priceRange) {
            const priceValue = (filters.priceRange.match(/\$/g) || []).length;
            filtered = filtered.filter(r => r.price === priceValue);
        } else if (filters.priceRangeArray && filters.priceRangeArray.length > 0) {
            filtered = filtered.filter(r => filters.priceRangeArray.includes(r.price));
        }
        
        // Filter by rating if specified
        if (filters.rating > 0) {
            filtered = filtered.filter(r => r.rating >= filters.rating);
        }
        
        // If no restaurants match the filters, return from the full list
        if (filtered.length === 0) {
            return restaurants[Math.floor(Math.random() * restaurants.length)];
        }
        
        // Return a random restaurant from the filtered list
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
    
    // Display the selected restaurant
    function displayRestaurant(restaurant) {
        hideLoadingState();
        
        // Create the restaurant result modal
        const modal = document.createElement('div');
        modal.className = 'restaurant-modal';
        modal.innerHTML = `
            <div class="restaurant-result">
                <div class="result-header">
                    <h2>Your Restaurant Pick</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="restaurant-details">
                    <div class="restaurant-icon">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <h3>${restaurant.name}</h3>
                    <p class="restaurant-address">
                        <i class="fas fa-map-marker-alt"></i> ${restaurant.address}
                    </p>
                    <p class="restaurant-cuisine">
                        <i class="fas fa-concierge-bell"></i> ${restaurant.cuisine}
                    </p>
                    <p class="restaurant-price">
                        ${'$'.repeat(restaurant.price)}
                    </p>
                    <p class="restaurant-rating">
                        ${'★'.repeat(Math.floor(restaurant.rating))}${restaurant.rating % 1 >= 0.5 ? '½' : ''}
                        <span class="rating-number">${restaurant.rating.toFixed(1)}</span>
                    </p>
                    <div class="restaurant-actions">
                        <button class="btn btn-primary btn-directions">
                            <i class="fas fa-directions"></i> Get Directions
                        </button>
                        <button class="btn btn-secondary btn-try-again">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyle = document.createElement('style');
        modalStyle.id = 'restaurant-modal-styles';
        modalStyle.textContent = `
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
            .restaurant-result {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 500px;
                overflow: hidden;
                animation: modalFadeIn 0.3s ease forwards;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                background-color: var(--primary-color);
                color: white;
            }
            .result-header h2 {
                margin: 0;
            }
            .close-modal {
                background: transparent;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
            }
            .restaurant-details {
                padding: 2rem;
                text-align: center;
            }
            .restaurant-icon {
                width: 80px;
                height: 80px;
                background-color: var(--light-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            }
            .restaurant-icon i {
                font-size: 2.5rem;
                color: var(--primary-color);
            }
            .restaurant-details h3 {
                font-size: 1.8rem;
                margin-bottom: 1rem;
                color: var(--dark-color);
            }
            .restaurant-address,
            .restaurant-cuisine,
            .restaurant-price,
            .restaurant-rating {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.8rem;
            }
            .restaurant-address i,
            .restaurant-cuisine i,
            .restaurant-price i {
                margin-right: 0.5rem;
                color: var(--gray-color);
                width: 20px;
            }
            .restaurant-rating {
                color: #ffc107;
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
            }
            .rating-number {
                margin-left: 0.5rem;
                color: var(--dark-color);
                font-size: 1rem;
            }
            .restaurant-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            .btn-directions,
            .btn-try-again {
                display: flex;
                align-items: center;
            }
            .btn-directions i,
            .btn-try-again i {
                margin-right: 0.5rem;
            }
            
            @media (max-width: 768px) {
                .restaurant-result {
                    width: 95%;
                }
                .restaurant-actions {
                    flex-direction: column;
                }
                .btn-directions,
                .btn-try-again {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        if (!document.getElementById('restaurant-modal-styles')) {
            document.head.appendChild(modalStyle);
        }
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const directionsBtn = modal.querySelector('.btn-directions');
        const tryAgainBtn = modal.querySelector('.btn-try-again');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        directionsBtn.addEventListener('click', () => {
            // Open Google Maps directions
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
            window.open(mapsUrl, '_blank');
        });
        
        tryAgainBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            findRandomRestaurant();
        });
    }
});