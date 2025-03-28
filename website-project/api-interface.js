// This file should be named api-interface.js
// It provides a JavaScript interface to the Java backend

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
            
            // Make POST request to the appropriate endpoint
            const response = await fetch(this.baseUrl + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error in findRandomRestaurant:', error);
            throw error;
        }
    }
    
    /**
     * Format filters for the backend API
     * @param {Object} filters - Filter criteria from the frontend
     * @returns {Object} - Formatted filters for the backend
     * @private
     */
    #formatFilters(filters) {
        const result = {};
        
        // Handle cuisine types
        if (filters.cuisineType) {
            result.cuisineTypes = [filters.cuisineType];
        } else if (filters.cuisinesToInclude && filters.cuisinesToInclude.length > 0) {
            result.cuisineTypes = filters.cuisinesToInclude;
        }
        
        // Handle price range
        if (filters.priceRange) {
            const priceValue = (filters.priceRange.match(/\$/g) || []).length;
            result.priceRange = [priceValue];
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