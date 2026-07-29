/**
 * Theme toggle functionality
 * Saves user preference in localStorage
 */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');

    if (!toggle) return;

    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');

    // Apply saved theme
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateToggleIcon(savedTheme);
    }

    // Toggle theme on click
    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });

    /**
     * Update the toggle button icon
     */
    function updateToggleIcon(theme) {
        const icon = toggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        } else {
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
});