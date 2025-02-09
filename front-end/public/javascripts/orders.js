import Client from './client.js';
const client = new Client();
var statusId;
var orderId = null;

document.addEventListener('DOMContentLoaded', () => {
  const statusDropdownButton = document.getElementById('update-order-status-btn')
  const updateForm = document.getElementById('order-update-form');

  /* Add click events to each edit button to retrieve the row's order id dataset and set the orderId to that value */
  const editBtns = document.querySelectorAll('#edit-btn');
  editBtns.forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('tr');
      orderId = +parent.dataset.orderId;
      statusDropdownButton.innerText = parent.dataset.orderStatus;
      statusId = +parent.dataset.orderStatusId
    })
  })

  /* Add click events to each status item to set the current statusId and assign the dropdown innerText the status' name */
  const statusItems = document.querySelectorAll('#status-item');
  statusItems.forEach(button => {
    button.addEventListener('click', () => {
      statusDropdownButton.innerText = button.dataset.statusName;
      statusId = +button.dataset.statusId;
    })
  })
  /* Submit form */
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const response = await client.fetch(`orders/${orderId}`, 'put', { StatusId: statusId });
    if (response?.ok) window.location.reload();
    else return
  })
})

