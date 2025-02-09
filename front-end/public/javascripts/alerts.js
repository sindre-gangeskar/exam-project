document.addEventListener('DOMContentLoaded', () => {
 /* Prevent the alert from being discarded after it's shown, default behaviour of bootstrap alerts are that they get removed after they've been dismissed */
  const alertWrapper = document.getElementById('client-alert-wrapper');
  alertWrapper.addEventListener('close.bs.alert', (e) => {
    e.preventDefault();
    alertWrapper.classList.remove('show');
  })
})