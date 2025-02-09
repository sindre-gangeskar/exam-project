import Client from './client.js';
const client = new Client();

var userId = 1;
var roleId = 1;

document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.querySelectorAll('#edit-btn');
  const updateForm = document.getElementById('user-update-form');
  const roles = document.querySelectorAll('#role-item');
  const roleDropdown = document.getElementById('role-dropdown-btn');

  editBtn.forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('tr');
      setUpdatModalData(parent, roleDropdown);
    })
  })

  roles.forEach(role => {
    role.addEventListener('click', () => {
      roleDropdown.innerText = role.dataset.roleName;
      roleId = +role.dataset.roleId;
    })
  })

  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(updateForm);
    const body = Object.fromEntries(formData.entries());
    body.RoleId = +roleId;

    const response = await client.fetch(`users/${userId}`, 'put', body);    
    if (response?.ok) window.location.reload();
    else return;
  })
})

function setUpdatModalData(parent, roleDropdownBtn) {
  const firstname = parent.dataset.firstname;
  const lastname = parent.dataset.lastname;
  const username = parent.dataset.username;
  const email = parent.dataset.email;
  const phone = parent.dataset.phone;
  const address = parent.dataset.address;
  roleDropdownBtn.innerText = parent.dataset.roleName;
  userId = parent.dataset.userId;
  roleId = parent.dataset.roleId;

  const usernameInput = document.getElementById('username-input');
  const firstnameInput = document.getElementById('firstname-input');
  const lastnameInput = document.getElementById('lastname-input');
  const emailInput = document.getElementById('email-input');
  const phoneInput = document.getElementById('phone-input');
  const addressInput = document.getElementById('address-input');

  usernameInput.value = username;
  firstnameInput.value = firstname;
  lastnameInput.value = lastname;
  emailInput.value = email;
  phoneInput.value = phone;
  addressInput.value = address;
}