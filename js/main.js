document.addEventListener('DOMContentLoaded', function () {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el, i) => setTimeout(() => el.style.opacity = 1, i * 120));

    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.getElementById('main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 880) {
                    mainNav.classList.remove('is-open');
                }
            });
        });
    }
});