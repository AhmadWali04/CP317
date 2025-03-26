// Comprehensive Location Access and Retrieval Module

class LocationService {
    constructor() {
        this.locationBtn = null;
        this.locationInput = null;
    }

    // Initialize location services
    init() {
        this.locationBtn = document.querySelector('.btn-location');
        this.locationInput = document.querySelector('.location-input');

        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => this.requestLocation());
        }
    }

    // Main method to request location
    requestLocation() {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser.');
            return;
        }

        // Check location permissions
        navigator.permissions.query({ name: 'geolocation' })
            .then(permissionStatus => {
                switch (permissionStatus.state) {
                    case 'granted':
                        this.getCurrentLocation();
                        break;
                    case 'prompt':
                        this.promptForLocation();
                        break;
                    case 'denied':
                        this.handleDeniedPermission();
                        break;
                }

                // Listen for permission changes
                permissionStatus.onchange = () => {
                    console.log('Geolocation permission changed to: ', permissionStatus.state);
                };
            })
            .catch(error => {
                console.error('Permission check error:', error);
                this.promptForLocation();
            });
    }

    // Get current location
    getCurrentLocation() {
        this.setButtonState('loading');

        navigator.geolocation.getCurrentPosition(
            (position) => this.handleLocationSuccess(position),
            (error) => this.handleLocationError(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // Handle successful location retrieval
    handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;

        // Send location to local server
        this.sendLocationToServer(latitude, longitude)
            .then(() => {
                // Update input with coordinates
                if (this.locationInput) {
                    this.locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }

                // Optional: Reverse geocoding
                this.reverseGeocode(latitude, longitude);

                this.setButtonState('success');
            })
            .catch(error => {
                console.error('Server location send error:', error);
                this.showError('Could not send location to server');
                this.setButtonState('error');
            });
    }

    // Send location to local server
    sendLocationToServer(latitude, longitude) {
        return fetch('http://localhost:8080/restaurantProject/LocalServer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude: latitude, 
                longitude: longitude
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Server response was not ok');
            }
            return response.text();
        });
    }

    // Handle location retrieval errors
    handleLocationError(error) {
        let errorMessage;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location access was denied. Please enable location permissions.";
                this.handleDeniedPermission();
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                errorMessage = "Location request timed out. Please try again.";
                break;
            default:
                errorMessage = "An unknown error occurred while getting location.";
        }

        this.showError(errorMessage);
        this.setButtonState('error');
    }

    // Prompt user for location access
    promptForLocation() {
        // Create a custom permission dialog
        const dialog = document.createElement('div');
        dialog.className = 'location-permission-dialog';
        dialog.innerHTML = `
            <div class="location-dialog-content">
                <i class="fas fa-map-marker-alt"></i>
                <h3>Allow Location Access</h3>
                <p>Restaurant Roulette wants to use your location to find nearby restaurants.</p>
                <div class="location-dialog-actions">
                    <button class="btn btn-primary" id="allow-location">Allow</button>
                    <button class="btn btn-secondary" id="block-location">Block</button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .location-permission-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .location-dialog-content {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .location-dialog-content i {
                font-size: 3rem;
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            .location-dialog-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 1.5rem;
            }
        `;
        document.head.appendChild(style);

        // Append dialog to body
        document.body.appendChild(dialog);

        // Add event listeners
        const allowBtn = dialog.querySelector('#allow-location');
        const blockBtn = dialog.querySelector('#block-location');

        allowBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            document.head.removeChild(style);
            this.getCurrentLocation();
        });

        blockBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            document.head.removeChild(style);
            this.handleDeniedPermission();
        });
    }

    // Handle denied location permissions
    handleDeniedPermission() {
        this.showError('Location access is blocked. To use location features, please enable location permissions in your browser settings.');
        this.setButtonState('error');
    }

    // Optional: Reverse Geocoding (requires Google Maps API)
    reverseGeocode(latitude, longitude) {
        // Note: Requires a Google Maps API key
        const apiKey = 'AIzaSyDGYZDBalEh2oeJP6SnU6mffWQNj4FPDt0';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const address = data.results[0].formatted_address;
                    if (this.locationInput) {
                        this.locationInput.value = address;
                    }
                }
            })
            .catch(error => {
                console.error('Reverse geocoding error:', error);
            });
    }

    // Show error message
    showError(message) {
        // Create an error toast or alert
        const errorToast = document.createElement('div');
        errorToast.className = 'location-error-toast';
        errorToast.textContent = message;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .location-error-toast {
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
        `;
        document.head.appendChild(style);
        document.body.appendChild(errorToast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            document.body.removeChild(errorToast);
            document.head.removeChild(style);
        }, 5000);
    }

    // Update button state
    setButtonState(state) {
        if (!this.locationBtn) return;

        switch (state) {
            case 'loading':
                this.locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
                this.locationBtn.disabled = true;
                break;
            case 'success':
                this.locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Location Found';
                this.locationBtn.disabled = false;
                break;
            case 'error':
                this.locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Location';
                this.locationBtn.disabled = false;
                break;
            default:
                this.locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Location';
                this.locationBtn.disabled = false;
        }
    }
}

// Initialize location service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const locationService = new LocationService();
    locationService.init();
});