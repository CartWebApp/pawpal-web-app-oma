document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menuIcon');
    const menuPanel = document.querySelector('.menuPanel');
    const closeMenuBtn = document.querySelector('.closeMenu');
    let isOpen = false;

    function toggleMenu() {
        isOpen = !isOpen;
        menuPanel.classList.toggle('open');
        
        // Update ARIA attributes
        menuPanel.setAttribute('aria-hidden', !isOpen);
        menuIcon.setAttribute('aria-expanded', isOpen);

        // If opening, focus the close button
        if (isOpen && closeMenuBtn) {
            closeMenuBtn.focus();
        }
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isOpen && !menuPanel.contains(e.target) && !menuIcon.contains(e.target)) {
            toggleMenu();
        }
    });

    // Setup click handlers
    if (menuIcon) {
        menuIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', toggleMenu);
    }

    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            toggleMenu();
        }
    });
});