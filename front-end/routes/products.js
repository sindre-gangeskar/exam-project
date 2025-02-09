const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');

const { isAuth } = require('../middleware/auth');


const Server = require('../javascripts/server');
const server = new Server();

const utils = require('../javascripts/utils');

router.get('/', isAuth, asyncHandler((async function (req, res, next) {
  const { data: { products } } = await server.fetch(req, res, 'products/all', 'get');
  const { data: { brands } } = await server.fetch(req, res, 'brands', 'get');
  const { data: { categories } } = await server.fetch(req, res, 'categories', 'get');

  products.forEach(product => {
    product.date_added = utils.formatDate(product.date_added);
    product.createdAt = utils.formatDate(product.createdAt);
    product.updatedAt = utils.formatDate(product.updatedAt)
  })

  return res.status(200).render('products', { title: 'Products', products: products, brands: brands, categories: categories });
})))
router.get('/deleted', isAuth, asyncHandler((async function (req, res, next) {
  const { data: { deleted } } = await server.fetch(req, res, 'products/deleted', 'get');
  const { data: { brands } } = await server.fetch(req, res, 'brands', 'get');
  const { data: { categories } } = await server.fetch(req, res, 'categories', 'get');

  deleted.forEach(product => {
    product.date_added = utils.formatDate(product.date_added);
    product.createdAt = utils.formatDate(product.createdAt);
    product.updatedAt = utils.formatDate(product.updatedAt)
  })

  return res.status(200).render('products', { title: 'Deleted Products', products: deleted, brands: brands, categories: categories });
})))
router.get('/search', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { products } } = await server.fetch(req, res, `products/search`, 'post', { search: decodeURIComponent(req.query.keyword) });
  const { data: { brands } } = await server.fetch(req, res, 'brands', 'get');
  const { data: { categories } } = await server.fetch(req, res, 'categories', 'get');

  products.forEach(product => {
    product.date_added = utils.formatDate(product.date_added);
    product.createdAt = utils.formatDate(product.createdAt);
    product.updatedAt = utils.formatDate(product.updatedAt)
  })

  return res.status(200).render('products', { title: 'Products', products: products, brands: brands, categories: categories });
}))
router.post('/', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, 'products', 'post', req.body);
  return res.status(response.data.statusCode).json(response);
}))
router.delete('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `products/${req.params.id}`, 'delete');
  return res.status(200).json(response);
}))
router.put('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `products/${req.params.id}`, 'put', req.body);
  return res.status(response.data.statusCode).json(response);
}))
module.exports = router; 