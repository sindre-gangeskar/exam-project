document.addEventListener('DOMContentLoaded', () => {
  const path = document.getElementById('path');
  path.innerHTML = `<b>Home</b>${window.location.pathname}`;
})