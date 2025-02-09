import Client from './client.js';
const client = new Client();

document.addEventListener('DOMContentLoaded', () => {
  const createdAt = document.querySelectorAll('.created-at');
  const updatedAt = document.querySelectorAll('.updated-at');

  createdAt.forEach(date => {
    date.innerText = client.formatDate(date.innerText);
  })
  updatedAt.forEach(date => {
    date.innerText = client.formatDate(date.innerText);
  })
})

