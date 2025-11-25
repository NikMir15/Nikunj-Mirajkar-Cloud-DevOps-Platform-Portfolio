// Small reveal + vanilla-tilt init (tilt script loaded via CDN in HTML)
document.addEventListener('DOMContentLoaded', function () {
    const rev = document.querySelectorAll('.reveal');
    rev.forEach((el, i) => setTimeout(() => el.style.opacity = 1, i * 90));

    // If the imported file wasn't loaded, skip
    if (window.VanillaTilt) {
        const tiltEls = document.querySelectorAll(".tilt-wrap");
        VanillaTilt.init(tiltEls, {
            max: 12,
            speed: 350,
            glare: true,
            "max-glare": 0.25
        });
    }
});
