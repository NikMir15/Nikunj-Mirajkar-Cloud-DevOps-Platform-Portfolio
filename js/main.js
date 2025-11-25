document.addEventListener('DOMContentLoaded', function () {
    // Original opacity fade-in for terminal text
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el, i) => setTimeout(() => el.style.opacity = 1, i * 120));

    // Mobile Navigation Toggle functionality
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });

        // Optional: Close menu when a link is clicked (useful on single-page views)
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Check if the screen width is 880px or less before closing
                if (window.innerWidth <= 880) {
                    mainNav.classList.remove('is-open');
                }
            });
        });
    }
});