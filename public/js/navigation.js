// ==========================================
// Mobile Navigation Toggle & Accessibility
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (toggleButton && navMenu) {
        // 1. Toggle menu on click
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            // Toggle classes
            navMenu.classList.toggle('show-menu');
            
            // Update ARIA attribute for screen readers
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            
            // Change icon (optional, assuming you have a hamburger and X)
            // toggleButton.innerHTML = !isExpanded ? '✕' : '☰';
        });

        // 2. Close menu when pressing Escape (Accessibility best practice)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
                navMenu.classList.remove('show-menu');
                toggleButton.setAttribute('aria-expanded', 'false');
                toggleButton.focus(); // Return focus to the button
            }
        });

        // 3. Close menu when clicking outside (Optional but good UX)
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('show-menu') && 
                !navMenu.contains(e.target) && 
                !toggleButton.contains(e.target)) {
                navMenu.classList.remove('show-menu');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
});