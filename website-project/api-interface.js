// Enhanced API interface with better error handling and filter processing

class RestaurantAPI {
    constructor() {
        // Base URL for the API - adjust this based on your server configuration
        this.baseUrl = 'http://localhost:8080/restaurantProject';
    }

    /**
     * Find a random restaurant based on location and filters
     * @param {Object} params - Search parameters
     * @param {string} params.location - Location string (address or coordinates)
     * @param {Object} params.filters - Filter criteria
     * @returns {Promise} - Promise that resolves with restaurant data
     */
    async findRandomRestaurant(params) {
        try {
            console.log('findRandomRestaurant called with params:', params);
            
            // Determine if location is coordinates or address
            let endpoint;
            let requestData = {};
            
            if (params.location.includes(',')) {
                // Appears to be coordinates, parse and use directly
                const coordinates = params.location.split(',');
                const latitude = parseFloat(coordinates[0].trim());
                const longitude = parseFloat(coordinates[1].trim());
                
                if (isNaN(latitude) || isNaN(longitude)) {
                    throw new Error('Invalid coordinates format');
                }
                
                // Use the coordinates directly with the search endpoint
                endpoint = '/search';
                requestData = {
                    latitude,
                    longitude,
                    filters: this.#formatFilters(params.filters)
                };
            } else {
                // Location is an address, use the address-based search
                endpoint = '/searchByAddress';
                requestData = {
                    address: params.location,
                    filters: this.#formatFilters(params.filters)
                };
            }
            
            console.log('API endpoint:', endpoint);
            console.log('Request data:', JSON.stringify(requestData));
            
            // Make POST request to the appropriate endpoint
            try {
                const response = await fetch(this.baseUrl + endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API request failed with status: ${response.status}`, errorText);
                    throw new Error(`API request failed with status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('API response data:', data);
                return data;
            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                
                // Check if Java backend is running or call fallback function
                const backendAvailable = await this.#checkBackendAvailability();
                
                if (!backendAvailable) {
                    console.warn('Backend server is not available, falling back to external API');
                    return await this.#fallbackToExternalAPI(params);
                }
                
                throw fetchError;
            }
        } catch (error) {
            console.error('Error in findRandomRestaurant:', error);
            throw error;
        }
    }
    
    /**
     * Check if backend server is available
     * @private
     * @returns {Promise<boolean>} - Whether the backend is available
     */
    async #checkBackendAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/getLocation`, {
                method: 'GET',
                // Add a short timeout to avoid long waiting times
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend availability check failed:', error);
            return false;
        }
    }
    
    /**
     * Fallback to an external API if our backend is not available
     * This is a simplified mock for demonstration
     * @private
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} - Restaurant data
     */
    async #fallbackToExternalAPI(params) {
        console.log('Using external API fallback with params:', params);
        
        // In a real implementation, you would call an external API like Google Places
        // For now, we'll return a mock response based on the filters
        
        // Create a mock restaurant based on the location and filters
        const filters = params.filters;
        const location = params.location;
        
        // Extract location info for the name
        let locationName = location;
        if (location.includes(',')) {
            // It's coordinates, make it friendlier
            locationName = 'Current Location';
        } else {
            // It's an address, just take the first part
            locationName = location.split(',')[0];
        }
        
        // Determine cuisine based on filters
        let cuisine = 'Various Cuisine';
        if (filters.cuisineType) {
            cuisine = filters.cuisineType;
        } else if (filters.cuisinesToInclude && filters.cuisinesToInclude.length > 0) {
            cuisine = filters.cuisinesToInclude[0].charAt(0).toUpperCase() + 
                     filters.cuisinesToInclude[0].slice(1);
        }
        
        // Determine price level
        let priceLevel = 2;
        if (filters.priceRange) {
            priceLevel = (filters.priceRange.match(/\$/g) || []).length;
        } else if (filters.priceRangeArray && filters.priceRangeArray.length > 0) {
            priceLevel = filters.priceRangeArray[0];
        }
        
        // Mock restaurants with different cuisines
        const mockRestaurants = [
            { 
                name: `${cuisine} Delight near ${locationName}`,
                address: `123 ${cuisine} Street, Near ${locationName}`,
                cuisine: cuisine,
                priceLevel: priceLevel,
                rating: 4.5
            },
            {
                name: `${cuisine} Express`,
                address: `456 Food Avenue, ${locationName}`,
                cuisine: cuisine,
                priceLevel: priceLevel,
                rating: 4.2
            },
            {
                name: `The ${cuisine} Place`,
                address: `789 Dining Road, ${locationName}`,
                cuisine: cuisine,
                priceLevel: priceLevel,
                rating: 4.7
            }
        ];
        
        // Filter for minimum rating if specified
        let filteredRestaurants = mockRestaurants;
        if (filters.rating && filters.rating > 0) {
            filteredRestaurants = filteredRestaurants.filter(r => r.rating >= filters.rating);
        }
        
        // Return a random restaurant from the filtered list
        // If no restaurants match the filters, return from the full list
        if (filteredRestaurants.length === 0) {
            return mockRestaurants[Math.floor(Math.random() * mockRestaurants.length)];
        }
        
        return filteredRestaurants[Math.floor(Math.random() * filteredRestaurants.length)];
    }
    
    /**
     * Format filters for the backend API
     * @param {Object} filters - Filter criteria from the frontend
     * @returns {Object} - Formatted filters for the backend
     * @private
     */
    #formatFilters(filters) {
        console.log('Formatting filters:', filters);
        
        const result = {};
        
        // Handle cuisine types
        if (filters.cuisineType) {
            result.cuisineTypes = [filters.cuisineType];
        } else if (filters.cuisinesToInclude && filters.cuisinesToInclude.length > 0) {
            result.cuisineTypes = filters.cuisinesToInclude;
        }
        
        // Handle price range
        if (filters.priceRange) {
            if (typeof filters.priceRange === 'string') {
                const priceValue = (filters.priceRange.match(/\$/g) || []).length;
                result.priceRange = [priceValue];
            } else {
                result.priceRange = [filters.priceRange]; 
            }
        } else if (filters.priceRangeArray && filters.priceRangeArray.length > 0) {
            result.priceRange = filters.priceRangeArray;
        }
        
        // Handle distance/radius (convert to meters if needed)
        if (filters.distance) {
            result.radius = filters.distance;
        }
        
        // Handle minimum rating
        if (filters.rating > 0) {
            result.minRating = filters.rating;
        }
        
        console.log('Formatted filters:', result);
        return result;
    }
    
    /**
     * Get the user's current location from the browser
     * @returns {Promise} - Promise that resolves with coordinates
     */
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve({ latitude, longitude });
                    },
                    (error) => {
                        reject(new Error(`Geolocation error: ${error.message}`));
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported by this browser'));
            }
        });
    }
    
    /**
     * Send user location to the backend server
     * @param {number} latitude - Latitude coordinate
     * @param {number} longitude - Longitude coordinate  
     * @returns {Promise} - Promise that resolves when location is sent
     */
    async sendLocationToServer(latitude, longitude) {
        try {
            const response = await fetch(`${this.baseUrl}/LocalServer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ latitude, longitude })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to send location: ${response.status}`);
            }
            
            return await response.text();
        } catch (error) {
            console.error('Error sending location to server:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const restaurantAPI = new RestaurantAPI();

// Export for use in other modules
export default restaurantAPI;