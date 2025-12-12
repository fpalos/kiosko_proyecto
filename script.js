// Handle card clicks in the menu
document.addEventListener('DOMContentLoaded', () => {
  console.log('index.js loaded - initializing card click handlers');
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const href = card.getAttribute('href');
      console.log('Card clicked, navigating to:', href);
      sessionStorage.setItem('cerrar-pestaña-después', 'true');
      window.location.href = href;
    });
  });
});