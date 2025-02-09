import Client from './client.js';
const client = new Client();

var brandId;
var categoryId;
var selectedProductId;

document.addEventListener('DOMContentLoaded', function () {
  const deleteButtons = document.querySelectorAll('button[id=delete-btn]');
  const editButtons = document.querySelectorAll('button[id=edit-btn]');
  const addProductBtn = document.getElementById('add-product');

  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');

  const createProductForm = document.getElementById('create-product-form');
  const updateProductForm = document.getElementById('update-product-form');

  /* Create product form */
  createProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(createProductForm);
    const body = Object.fromEntries(formData.entries());

    body.quantity = +body.quantity;
    body.unitprice = +body.unitprice;
    body.BrandId = +brandId;
    body.CategoryId = +categoryId;

    const response = await client.fetch('products', 'post', body);

    if (response?.ok) window.location.reload();
    else return;
  })
  /* Update product form */
  updateProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(updateProductForm);
    const body = Object.fromEntries(formData.entries());

    body.isdeleted = body.isdeleted ? 1 : 0;
    body.quantity = +body.quantity;
    body.unitprice = +body.unitprice;
    body.BrandId = +brandId;
    body.CategoryId = +categoryId;
    body.imgurl ? body.imgurl : '';

    const response = await client.fetch(`products/${selectedProductId}`, 'put', body);
    if (response?.ok) window.location.reload();
    else return;
  })
  /* Initialize click events for each delete button relevant to each product in the table and initialize the modal's data with the product data */
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const parentElement = button.closest('tr');
      const productName = parentElement.dataset.productName;
      selectedProductId = parentElement.dataset.productId;
      setDeleteModalData(productName);
    });
  })
  /* Initialize click events for each edit button for each product in the table and initialize the update modal's data with the product's data */
  editButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const parentElement = button.closest('tr');
      const productName = parentElement.dataset.productName;
      const productDescription = parentElement.dataset.productDescription;
      const productBrand = parentElement.dataset.brand;
      const productCategory = parentElement.dataset.category;
      const productQuantity = parentElement.dataset.productQuantity;
      const pricePerUnit = parentElement.dataset.productPricePerUnit;
      const productDeleted = parentElement.dataset.productDeleted;
      const productImageUrl = parentElement.dataset.productImageUrl;

      brandId = parentElement.dataset.productCurrentBrandId || brandId;
      categoryId = parentElement.dataset.productCurrentCategoryId || categoryId;
      selectedProductId = parentElement.dataset.productId;

      setUpdateModalData(productName, productDescription, productQuantity, pricePerUnit, productImageUrl, productBrand, productCategory, productDeleted);
    })
  })
  /* Send the delete request when clicking on the confirm button in the delete modal */
  const confirmDeleteButton = document.getElementById('confirm-delete-btn');
  confirmDeleteButton.addEventListener('click', async () => {
    const response = await client.fetch(`products/${selectedProductId}`, 'delete')
    const data = await response.json();

    if (response.ok) window.location.reload();
    else client.displayClientMessage('error', data.data.error, data.data.result);
  })
  /* Search input - do nothing if the field is empty */
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (searchInput.value === '') return;
    else {
      searchForm.action = `http://localhost:3001/products/search/`;
      searchForm.submit();
    }
  })
  /* Initialize modal dropdown data */
  addProductBtn.addEventListener('click', () => {
    initializeModalDropdownData();
  })
})

function setDeleteModalData(productName) {
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  modalTitle.innerText = `Delete product`;
  modalDescription.innerHTML = `Are you sure you want to delete <b>${productName}?</b>`;
}
function setUpdateModalData(productName, productDescription, productQuantity, productPrice, imgUrl, brand, category, deleted) {
  const name = document.getElementById('product-name');
  const description = document.getElementById('product-description');
  const quantity = document.getElementById('product-quantity');
  const pricePerUnit = document.getElementById('product-price-per-unit');
  const isDeleted = document.getElementById('delete-toggle');
  const imageUrl = document.getElementById('product-image-url');
  const brandDropdown = document.getElementById('update-brand-dropdown');
  const categoryDropdown = document.getElementById('update-category-dropdown');
  const brandItems = document.querySelectorAll('button[id=update-brand-item]');
  const categoryItems = document.querySelectorAll('button[id=update-category-item]');

  brandItems.forEach(item => {
    item.addEventListener('click', () => {
      brandId = item.dataset.brandId;
      brandDropdown.innerText = item.dataset.brandValue;
    })
  })
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      categoryId = item.dataset.categoryId;
      categoryDropdown.innerText = item.dataset.categoryValue;
    })
  })

  /* Initial data of the product */
  brandDropdown.innerText = brand;
  categoryDropdown.innerText = category;
  isDeleted.checked = +deleted === 0 ? false : true;
  name.value = productName;
  imageUrl.value = imgUrl;
  description.value = productDescription;
  quantity.value = productQuantity;
  pricePerUnit.value = productPrice;
}
function initializeModalDropdownData() {
  const brandDropdown = document.getElementById('create-brand-dropdown');
  const categoryDropdown = document.getElementById('create-category-dropdown');
  const brandItems = document.querySelectorAll('button[id=create-brand-item]')
  const categoryItems = document.querySelectorAll('button[id=create-category-item');

  /* Set default data */
  brandId = brandItems[ 0 ].dataset.brandId;
  categoryId = categoryItems[ 0 ].dataset.categoryId;
  brandDropdown.innerText = brandItems[ 0 ].dataset.brandValue;
  categoryDropdown.innerText = categoryItems[ 0 ].dataset.categoryValue;

  brandItems.forEach(item => {
    item.addEventListener('click', () => {
      brandId = item.dataset.brandId;
      brandDropdown.innerText = item.dataset.brandValue;
    })
  })
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      categoryId = item.dataset.categoryId;
      categoryDropdown.innerText = item.dataset.categoryValue;
    })
  })
}