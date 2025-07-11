// Burger menu logic
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});
// Close mobile menu when a link is clicked
const navLinkItems = navLinks.querySelectorAll('a');
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
  });
});
// Fullscreen gallery logic
const fullscreenableImages = document.querySelectorAll('.fullscreenable');
let fullscreenOverlay = null;
fullscreenableImages.forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', function() {
    if (fullscreenOverlay) return;
    fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.className = 'fullscreen-overlay';
    fullscreenOverlay.innerHTML = `
      <img src="${img.src}" alt="${img.alt}" class="fullscreen-img" />
      <button class="close-fullscreen" aria-label="Close fullscreen"><i class="fas fa-times"></i></button>
    `;
    document.body.appendChild(fullscreenOverlay);
    setTimeout(() => fullscreenOverlay.classList.add('active'), 10);
    // Close on overlay click or button click
    fullscreenOverlay.addEventListener('click', e => {
      if (e.target === fullscreenOverlay || e.target.classList.contains('close-fullscreen') || e.target.closest('.close-fullscreen')) {
        fullscreenOverlay.classList.remove('active');
        setTimeout(() => {
          fullscreenOverlay.remove();
          fullscreenOverlay = null;
        }, 300);
      }
    });
    // Prevent click on image from closing
    fullscreenOverlay.querySelector('.fullscreen-img').addEventListener('click', e => e.stopPropagation());
  });
});