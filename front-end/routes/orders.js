const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');

const { formatDate } = require('../javascripts/utils');

const { isAuth } = require('../middleware/auth');

const Server = require('../javascripts/server');
const server = new Server();

router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { orders = [] } } = await server.fetch(req, res, 'orders/all', 'get');
  const { data: { statuses = [] } } = await server.fetch(req, res, 'statuses', 'get');
  /* Format the timestamps to be easier to read (YYYY-MM-DD HH:MM:SS)*/
  orders.forEach(order => {
    order.createdAt = formatDate(order.createdAt);
    order.updatedAt = formatDate(order.updatedAt);
  })
  return res.status(200).render('orders', { orders: orders, title: 'Orders', statuses: statuses });
}))

router.get('/details/:ordernumber', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { order = [] } } = await server.fetch(req, res, `orders/${req.params.ordernumber}`, 'get');
  return res.status(200).render('orderDetails', { title: 'Order Details', order: order, orderNumber: req.params.ordernumber });
}))

router.put('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `orders/${req.params.id}`, 'put', req.body);
  return res.status(response.data.statusCode).json(response);
}))

module.exports = router;