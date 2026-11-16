/**
 * Theme toggle functionality
 * Saves user preference in localStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');

    if (!toggle) return;

    // Get current theme (already applied by the inline script in the <head>)
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    // Update the icon to match the current state on load
    updateToggleIcon(currentTheme);

    // Toggle theme on click
    toggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });

    /**
     * Update the toggle button icon and accessibility labels
     */
    function updateToggleIcon(theme) {
        const icon = toggle.querySelector('.theme-icon');
        const iconChar = theme === 'dark' ? '☀️' : '🌙';
        
        if (icon) {
            icon.textContent = iconChar;
        } else {
            toggle.textContent = iconChar;
        }
        
        // Accessibility: update aria-label
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
});