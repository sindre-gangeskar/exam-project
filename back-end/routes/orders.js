const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const db = require('../models');
const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);

const utils = require('../javascripts/utils');

router.get('/all', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Orders']
  #swagger.description = 'An **admin** can retrieve all orders for all customers'
  #swagger.responses[200] = {description: 'This response is returned when the API successfully retrieves all orders. If no orders are found, an **empty array** will be returned', schema: {$ref: '#/definitions/ordersGetSuccess'}}
  #swagger.responses[401] = {description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[500] = {description: 'This response is returned when an internal server occurrs while the API is trying to get all orders', schema: {$ref: '#/definitions/ordersGetInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const orders = await orderService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: orders.length > 0 ? 'Successfully found orders' : 'No orders registered', orders: orders });
}))
router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  /*
 #swagger.tags = ['Orders']
 #swagger.description = 'A logged in **user** can retrieve orders that belong to the **user**.'
 #swagger.responses[200] = {description: 'This response is returned when the API successfully retrieves all orders for the relevant **user**. If no orders are found, an **empty array** will be returned', schema: {$ref: '#/definitions/ordersGetSuccess'}}
 #swagger.responses[401] = {description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
 #swagger.responses[500] = {description: 'This response is returned when An internal server has occurrs while the API is trying to get all orders for the current **User**', schema: {$ref: '#/definitions/ordersGetUserInternalError'}}
 #swagger.security = [{userAuth: []}]
 */
  const orders = await orderService.getAllByUserId(req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: orders.length > 0 ? 'Successfully found orders' : 'No orders registered', orders: orders });
}))
router.get('/:ordernumber', isAuth, asyncHandler(async function (req, res, next) {
  /*
   #swagger.tags = ['Orders']
   #swagger.description = 'A **user** can view order details by providing the order number which includes products, quantity, price and total price for the order. An **admin** user can view any order\'s details without direct ownership'
   #swagger.parameters['ordernumber'] = {description: 'The ordernumber', required: true}
   #swagger.responses[200] = {description: 'This response is returned when the API successfully retrieves order details with the provided **ordernumber**', schema: {$ref: '#/definitions/ordersGetByOrderNumberSuccess'}}
   #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
   #swagger.responses[404] = {description: 'This response is returned when the API fails to find order details with the provided **ordernumber**', schema: {$ref: '#/definitions/ordersGetByOrderNumberNotFound'}}
   #swagger.responses[500] = {description: 'This response is returned when an internal server occurrs while the API is trying to get order details with the provided **ordernumber**', schema: {$ref: '#/definitions/ordersGetByOrderNumberInternalError'}}
   #swagger.security = [{adminAuth: []}]
   */
  const details = await orderService.getOrderDetails(req.params.ordernumber, req.user);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully found order details', order: details })
}))
router.put('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Orders']
  #swagger.description = 'An **admin** can update the status of an order.'
  #swagger.parameters['id'] = {description: 'The order id', required: true}
  #swagger.parameters['body'] = {in: 'body', description: 'The **StatusId** property is required in order to update an order\'s status', schema: {StatusId: 2}, required: true}
  #swagger.responses[200] = {description: 'This response is returned when the API successfully updates the order status', schema: {$ref: '#/definitions/ordersOrderUpdateSuccess'}}
  #swagger.responses[400] = {description: 'This response is returned when **admin** fails to include StatusId in the body or the provided value isn\'t a **number**', schema: {$ref: '#/definitions/ordersOrderUpdateUserError'}}
  #swagger.responses[401] = {description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[404] = {description: 'This response is returned when the API fails to find an order with the provided order id, or the status id', schema: {$ref: '#/definitions/ordersOrderUpdateNotFound'}}
  #swagger.responses[500] = {description: 'This response is returned when an internal server has occurrs while the API is trying to get all orders', schema: {$ref: '#/definitions/ordersOrderUpdateInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const { StatusId } = req.body;
  const expectedType = { StatusId: 'number' };
  const acceptedProperty = [ 'StatusId' ];

  utils.validateAcceptedProperties(req.body, acceptedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await orderService.updateStatus(req.params.id, StatusId);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated status of order', orderStatus: StatusId });
}))

module.exports = router;