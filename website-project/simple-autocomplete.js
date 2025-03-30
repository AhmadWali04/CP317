/**
 * Simple Address Autocomplete
 * This provides basic autocomplete functionality without relying on Google Maps API
 */

document.addEventListener('DOMContentLoaded', function() {
    const locationInput = document.querySelector('.location-input');
    if (!locationInput) return;
    
    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-items';
    autocompleteContainer.style.display = 'none';
    locationInput.parentNode.insertBefore(autocompleteContainer, locationInput.nextSibling);
    
    // Sample locations - replace with your own or fetch from backend
    const sampleLocations = [
        "Toronto, ON, Canada",
        "Toronto Airport, ON, Canada",
        "Toronto City Hall, ON, Canada",
        "New York, NY, USA",
        "Los Angeles, CA, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Vancouver, BC, Canada",
        "Montreal, QC, Canada",
        "Calgary, AB, Canada",
        "Ottawa, ON, Canada",
        "Edmonton, AB, Canada"
    ];
    
    // Input event for autocomplete
    locationInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        // Clear previous suggestions
        autocompleteContainer.innerHTML = '';
        autocompleteContainer.style.display = 'none';
        
        if (!value) return;
        
        // Filter locations based on input
        const matches = sampleLocations.filter(location => 
            location.toLowerCase().includes(value)
        );
        
        if (matches.length > 0) {
            autocompleteContainer.style.display = 'block';
            
            // Add matches to dropdown
            matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                
                // Highlight the matching part
                const matchIndex = match.toLowerCase().indexOf(value);
                const beforeMatch = match.substring(0, matchIndex);
                const matchedText = match.substring(matchIndex, matchIndex + value.length);
                const afterMatch = match.substring(matchIndex + value.length);
                
                item.innerHTML = `${beforeMatch}<strong>${matchedText}</strong>${afterMatch}`;
                
                item.addEventListener('click', function() {
                    locationInput.value = match;
                    autocompleteContainer.style.display = 'none';
                });
                
                autocompleteContainer.appendChild(item);
            });
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== locationInput) {
            autocompleteContainer.style.display = 'none';
        }
    });
    
    // Add some basic styles
    const style = document.createElement('style');
    style.textContent = `
        .autocomplete-items {
            position: absolute;
            border: 1px solid #ddd;
            border-top: none;
            z-index: 99;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 300px;
            overflow-y: auto;
            background-color: white;
            border-radius: 0 0 4px 4px;
        }
        
        .autocomplete-item {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        
        .autocomplete-item:hover {
            background-color: #f8f9fa;
        }
        
        .location-input {
            position: relative;
        }
        
        .search-container {
            position: relative;
        }
    `;
    document.head.appendChild(style);
});