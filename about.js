// About Section JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initAboutSection();
});

function initAboutSection() {
    // Animate statistics counting
    initStatsCounter();
    
    // Setup CTA buttons
    setupAboutButtons();
    
    // Setup image lazy loading
    initLazyLoading();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Setup ARIA labels for accessibility
    setupARIALabels();
}

function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statNumbers.length) return;
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Animate counting
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 50; // Adjust speed
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '+');
        }, 30);
    }
    
    // Start animation when in viewport
    let animated = false;
    
    function checkStats() {
        if (animated) return;
        
        const firstStat = statNumbers[0];
        if (firstStat && isInViewport(firstStat)) {
            animated = true;
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.count);
                if (!isNaN(target)) {
                    animateCounter(stat, target);
                }
            });
        }
    }
    
    // Check on scroll and load
    window.addEventListener('scroll', checkStats);
    window.addEventListener('load', checkStats);
    checkStats(); // Initial check
}

function setupAboutButtons() {
    // Get Directions Button
    const directionsBtn = document.getElementById('directionsBtn');
    if (directionsBtn) {
        directionsBtn.addEventListener('click', function() {
            const address = "B10 Chilla Plaza Gjuba Road Damaturu, Yobe State, Nigeria";
            const encodedAddress = encodeURIComponent(address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
            
            // Track event
            trackEvent('get_directions', { from: 'about_section' });
        });
    }
    
    // Shop Now Button in CTA
    const aboutShopBtn = document.getElementById('aboutShopBtn');
    if (aboutShopBtn) {
        aboutShopBtn.addEventListener('click', function() {
            // Scroll to products section
            document.getElementById('products').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Track event
            trackEvent('shop_now_cta', { from: 'about_section' });
        });
    }
    
    // Contact Us Button in CTA
    const aboutContactBtn = document.getElementById('aboutContactBtn');
    if (aboutContactBtn) {
        aboutContactBtn.addEventListener('click', function() {
            // Scroll to contact section
            document.getElementById('contact').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Track event
            trackEvent('contact_cta', { from: 'about_section' });
        });
    }
}

function initLazyLoading() {
    // Lazy load images in about section
    const images = document.querySelectorAll('.about-image img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

function setupKeyboardNavigation() {
    // Make team cards and value cards focusable
    const focusableCards = document.querySelectorAll('.team-member, .value-card, .mission, .vision');
    
    focusableCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

function setupARIALabels() {
    // Add ARIA labels for screen readers
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.setAttribute('aria-label', 'About Mayor\'s Store');
    }
    
    // Add labels to team members
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        const name = member.querySelector('h5').textContent;
        const role = member.querySelector('.member-role').textContent;
        member.setAttribute('aria-label', `Team member: ${name}, ${role}`);
    });
    
    // Add labels to stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach(stat => {
        const number = stat.querySelector('.stat-number').textContent;
        const label = stat.querySelector('.stat-label').textContent;
        stat.setAttribute('aria-label', `${number} ${label}`);
    });
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAboutSection,
        initStatsCounter
    };
}