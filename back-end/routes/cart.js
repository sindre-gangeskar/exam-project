const express = require('express');
const router = express.Router();

const { isAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const utils = require('../javascripts/utils');

const db = require('../models');
const CartService = require('../services/CartService');
const cartService = new CartService(db);

const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);

router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Cart']
  #swagger.description = 'A **logged in user** can retrieve all items that have been added to the user\'s cart. If the cart is empty, an **empty array** will be returned' 
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all items placed in cart for current user, if no cart items are found an **empty array** is returned', schema: {$ref: '#/definitions/cartGetSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when **an internal server** has occurred while the API is trying to get all items in cart for the current user', schema: {$ref: '#/definitions/cartGetInternalError'}}
  #swagger.security = [{userAuth: []}, {adminAuth: []}]
  */

  const cart = await cartService.getAll(req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: cart.length > 0 ? 'Successfully found cart item(s)' : 'Cart is empty', cart: cart, img: cart.ImgURL });
}))
router.post('/', isAuth, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Cart']
  #swagger.description = 'A **logged in user** can add a product to the cart'
  #swagger.parameters['body'] = {in: 'body', description: 'The **product id** must be provided in order to add a product to cart',schema: { ProductId: 1 }, required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successfully adds a product to the cart', schema: {$ref: '#/definitions/cartPostSuccess'}}
  #swagger.responses[400] = { description: 'This response is returned when the **user** provides incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/cartPostUserError'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API is unable to find a product with the provided id the user wishes to add to cart', schema: {$ref: '#/definitions/cartPostNotFound'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to add a product to cart', schema: {$ref: '#/definitions/cartPostInternalError'}}
  #swagger.security = [{userAuth: []}, {adminAuth: []}]
  */
  const { ProductId } = req.body;
  const expectedTypes = { ProductId: 'number' };
  const expectedProperty = [ 'ProductId' ];

  utils.validateRequiredProperties(req.body, expectedProperty);
  utils.validateVariableTypes(req.body, expectedTypes);

  await cartService.create(ProductId, req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully added product to cart' });
}))
router.post('/checkout/now', isAuth, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Cart']
  #swagger.description = 'A **logged in user** can proceed to checkout and an **order** will be created with a unique **order number**'
  #swagger.responses[200] = { description: 'This response is returned when the API succeeds in checking out all cart products in the cart for the logged in user', schema: {$ref: '#/definitions/cartCheckoutSuccess'}}
  #swagger.responses[400] = { description: 'This response is returned when the API fails to find items in the cart for the logged in user', schema: {$ref: '#/definitions/cartCheckoutUserError'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when **an internal error** occurrs while the API is trying to check out all of the items placed in the cart for the logged in user', schema: {$ref: '#/definitions/cartCheckoutInternalError'}}
  #swagger.security = [{adminAuth: []}, {userAuth: []}]
  */
  const ordernumber = await orderService.create(req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully purchased items', ordernumber: ordernumber });
}))
router.delete('/:id', isAuth, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Cart']
  #swagger.description = 'A **logged in user** can remove an item from its cart'
  #swagger.parameters['id'] = { description: 'The cart item id', required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successfully deleted a cart item', schema: {$ref: '#/definitions/cartDeleteSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API is unable to find a cart item with the id provided by the user', schema: {$ref: '#/definitions/cartDeleteNotFound'}}
  #swagger.responses[500] = { description: 'This response is returned when an **an internal error** occurrs while the API is trying remove an item from cart', schema: {$ref: '#/definitions/cartDeleteInternalError'}}
  #swagger.security = [{adminAuth: []}, {userAuth: []}]
  */
  await cartService.delete(req.params.id, req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully deleted item from cart' });
}))
router.put('/:id', isAuth, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Cart']
  #swagger.parameters['body'] = {in: 'body', description: 'The properties available. Only **one** property is allowed at a time', schema: {totalQuantity: 1, add: 10, remove: 5}, required: true}
  #swagger.parameters['id'] = { description: 'The cart item id', required: true}
  #swagger.description = 'A **logged in user** can update the item\'s quantity by using **Add**, **Remove** or **TotalQuantity** in the body.'  
  #swagger.responses[200] = { description: 'This response is returned when the API successfully updates a cart item', schema: {$ref: '#/definitions/cartUpdateSuccess'}}
  #swagger.responses[400] = { description: 'This response is returned when the **user** has provided incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/cartUpdateUserError'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API is unable to find a cart item by the id the **user** provided', schema: {$ref: '#/definitions/cartUpdateNotFound'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to update a cart item', schema: {$ref: '#/definitions/cartUpdateInternalError'}}
  #swagger.security = [{adminAuth: []}, {userAuth: []}]
  */
  const expectedTypes = { totalQuantity: 'number', add: 'number', remove: 'number' };
  const acceptedProperties = [ 'totalQuantity', 'add', 'remove' ];

  utils.validateAcceptedProperties(req.body, acceptedProperties);
  utils.validateVariableTypes(req.body, expectedTypes);

  const cart = await cartService.update(req.params.id, req.user.id, req.body)
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated item in cart', cart: cart });
}))


module.exports = router;