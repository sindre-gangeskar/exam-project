import Client from './client.js';
const client = new Client();

var currentCategoryId = 1;
document.addEventListener('DOMContentLoaded', () => {
  const editButtons = document.querySelectorAll('button[id=edit-btn')
  const deleteButtons = document.querySelectorAll('button[id=delete-btn');
  const updateForm = document.getElementById('category-update-form');
  const postForm = document.getElementById('category-post-form');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const categoryName = button.closest('tr').dataset.categoryName;
      currentCategoryId = button.closest('tr').dataset.categoryId;
      setDeleteModalData(categoryName);
    })
  })
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const parent = button.closest('tr');
      const categoryName = parent.dataset.categoryName;
      currentCategoryId = parent.dataset.categoryId;

      setUpdateModalData(categoryName);
    })
  })
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(postForm);
    const body = Object.fromEntries(formData.entries());

    const response = await client.fetch('categories', 'post', body);
    if (response?.ok) window.location.reload();
    else return;
  })
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(updateForm);
    const body = Object.fromEntries(formData.entries());

    const response = await client.fetch(`categories/${currentCategoryId}`, 'put', body);
    if (response?.ok) window.location.reload();
    else return;
  })
  confirmDeleteBtn.addEventListener('click', async () => {
    const response = await client.fetch(`categories/${currentCategoryId}`, 'delete');
    if (response?.ok) window.location.reload();
    else return;
  })
})

function setUpdateModalData(name) {
  const categoryNameInput = document.getElementById('category-name-input');
  categoryNameInput.value = name;
}

function setDeleteModalData(name) {
  const description = document.getElementById('delete-modal-description');
  description.innerHTML = `Are you sure you want to permanently delete <b>${name}</b> `
}
