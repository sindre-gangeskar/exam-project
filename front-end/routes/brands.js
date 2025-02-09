const express = require('express');
const router = express.Router();

const Server = require('../javascripts/server');
const server = new Server();

const { isAuth } = require('../middleware/auth');


const asyncHandler = require('../middleware/asyncHandler');

router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { brands } } = await server.fetch(req, res, 'brands', 'get');
  return res.status(200).render('brands', { brands: brands, title: 'Brands' });
}))

router.delete('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `brands/${req.params.id}`, 'delete');
  return res.status(response.data.statusCode).json(response);
}))

router.put('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `brands/${req.params.id}`, 'put', req.body);
  return res.status(response.data.statusCode).json(response);
}))

router.post('/', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `brands`, 'post', req.body);
  return res.status(response.data.statusCode).json(response);
}))

module.exports = router;