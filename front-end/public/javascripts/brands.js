import Client from './client.js';
const client = new Client();

var brandRow;
var brandName;
let currentBrandId;
document.addEventListener('DOMContentLoaded', () => {

  const updateBrandForm = document.getElementById('brand-update-form');
  const createBrandForm = document.getElementById('brand-post-form');
  const deleteButtons = document.querySelectorAll('button[id=delete-btn]');
  const editButtons = document.querySelectorAll('button[id=edit-btn]');

  /* Set event listeners for the delete buttons in the table */
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      brandRow = button.closest('tr');
      brandName = brandRow.dataset.brandName;
      currentBrandId = brandRow.dataset.brandId;
      setDeleteModalData(brandName);
    });
  })

  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      brandRow = button.closest('tr');
      brandName = brandRow.dataset.brandName;
      currentBrandId = brandRow.dataset.brandId;
      setUpdateModalData(brandName);
    })
  })

  /* Update brand form */
  updateBrandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(updateBrandForm);
    const body = Object.fromEntries(formData.entries());

    const response = await client.fetch(`brands/${currentBrandId}`, 'put', body);

    if (response?.ok) window.location.reload();
    else return;
  })
  /* Create brand form */
  createBrandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createBrandForm);
    const body = Object.fromEntries(formData.entries());
    const response = await client.fetch('brands', 'post', body);
    if (response?.ok) window.location.reload();
    else return;
  })
  /* Confirm deletiton of brand  */
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  confirmDeleteBtn.addEventListener('click', async () => {
    const response = await client.fetch(`brands/${currentBrandId}`, 'delete')
    if (response?.ok) window.location.reload();
    else return;
  })
})

function setDeleteModalData(brandName) {
  const modalDescription = document.getElementById('delete-modal-description');
  const modalTitle = document.getElementById('delete-modal-title');

  modalTitle.innerText = 'Delete brand';
  modalDescription.innerHTML = `Are you sure you want to permanently delete the <b>${brandName}</b> brand?`;
}

function setUpdateModalData(brandName) {
  const brandInput = document.getElementById('brand-name-input');
  brandInput.value = brandName;
}
