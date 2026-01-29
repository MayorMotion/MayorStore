// In contact.js - Update the initMapButton function:
function initMapButton() {
    const viewMapBtn = document.getElementById('viewMapBtn');
    
    if (!viewMapBtn) return;
    
    viewMapBtn.addEventListener('click', function() {
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Opening Maps...';
        this.disabled = true;
        
        // Updated location for Damaturu, Yobe State
        const storeLocation = {
            address: "B10 Chilla Plaza Gjuba Road Damaturu, Yobe State, Nigeria",
            coordinates: "11.7467,11.9608", // Damaturu coordinates
            name: "Mayor's Store"
        };
        
        // Open Google Maps in a new tab
        setTimeout(() => {
            const address = encodeURIComponent(storeLocation.address);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
            
            // Try to open with coordinates for better accuracy
            const coordsUrl = `https://www.google.com/maps?q=${storeLocation.coordinates}&z=15`;
            
            // Open the map
            window.open(mapsUrl, '_blank');
            
            // Restore button state
            this.textContent = originalText;
            this.disabled = false;
            
            // Show notification
            showNotification('Opening Google Maps with our Damaturu location...', 'info');
            
            // Log the visit for analytics
            console.log('Map opened for location:', storeLocation.address);
            
        }, 500);
    });
    
    // Optional: Add a click event to the map placeholder itself
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.style.cursor = 'pointer';
        mapPlaceholder.title = 'Click to view location on Google Maps';
        
        mapPlaceholder.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-view-map')) {
                document.getElementById('viewMapBtn').click();
            }
        });
    }
}