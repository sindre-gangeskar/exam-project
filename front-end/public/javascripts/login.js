import Client from './client.js';
const client = new Client();

document.addEventListener('DOMContentLoaded', () => {
  const populateForm = document.getElementById('populate-form');
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const body = Object.fromEntries(formData.entries());
    const response = await client.fetch('login', 'post', body);

    if (response?.ok) {
      const loginInputs = loginForm.querySelectorAll('input');
      const populateBtn = document.getElementById('populate-btn');

      loginInputs.forEach(child => { child.setAttribute('disabled', true) });
      populateBtn.setAttribute('disabled', true);

      client.displayClientMessage('success', 'Login Successful', 'Successfully logged in - redirecting in 3 seconds');
      client.redirect('/products', 3000);
    }
  })

  populateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await client.fetch('initialize', 'post');
    const data = await response.json();
    const messageTitle = 'Database Population';

    if (data.data.statusCode == 201) client.displayClientMessage('success', messageTitle, data.data.result);
    else if (data.data.statusCode === 200) client.displayClientMessage('warning', messageTitle, data.data.result);
    else client.displayClientMessage('error', data.data.error, data.data.result);
  })
})