// Mega menu — mobile accordion + outside-click-to-close
const hamburger = document.querySelector('.nav__hamburger');
const navMenu = document.querySelector('.nav__menu');

if (hamburger && navMenu) {
  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  });

  // Mobile accordion — toggle group dropdowns
  navMenu.querySelectorAll('.nav__group-label').forEach(label => {
    label.addEventListener('click', (e) => {
      // Only accordion behavior on mobile
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const group = label.closest('.nav__group');
      const wasOpen = group.classList.contains('open');

      // Close all groups
      navMenu.querySelectorAll('.nav__group.open').forEach(g => g.classList.remove('open'));

      // Toggle clicked group
      if (!wasOpen) group.classList.add('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.querySelectorAll('.nav__group.open').forEach(g => g.classList.remove('open'));
    }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    // Close all others
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    // Toggle this one
    item.classList.toggle('open');
    if (!isOpen) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = null;
    }
  });
});
