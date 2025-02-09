const express = require('express');
const router = express.Router();

const { isAuth, isAdmin, checkRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const db = require('../models');

const ProductService = require('../services/ProductService');
const productService = new ProductService(db);

const utils = require('../javascripts/utils');

router.get('/', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Products']
  #swagger.description = 'A **guest** and any **users** can retrieve all available products'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all available products. If no products are found, an **empty array** will be returned', schema: {$ref: '#/definitions/productsGetSuccess'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while is trying to get all available products' , schema: {$ref: '#/definitions/productsGetInternalError'}}
  */
  const products = await productService.getAllNonDeleted(req);
  return res.status(200).jsend.success({ statusCode: 200, result: products.length > 0 ? 'Successfully found products' : 'No products found', products: products });
}));

router.get('/all', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Products']
  #swagger.description = 'An **admin** can retrieve all products, including the **deleted** ones'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all products which also includes the **deleted** ones. If no products are found, an **empty array** will be returned', schema: {$ref: '#/definitions/productsGetAllSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
  #swagger.responses[500] = { description: 'This response is returned when  an **internal server error** occurrs while the API is trying to get products', schema: {$ref: '#/definitions/productsGetAllInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const products = await productService.getAll(req);
  return res.status(200).jsend.success({ statusCode: 200, result: products.length > 0 ? 'Successfully found products' : 'No products found', products: products });
}))

/* Using checkRole middleware to check for the role of the user and allow only admins to get the deleted items during a search, as search is available to anyone, even guests */
router.post('/search', checkRole, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Products']
  #swagger.parameters['body'] = {in: 'body', description: 'The **search** property in body is required, and its value must be a non-empty string', schema: {search: 'exampleBrand'}, required: true}
  #swagger.description = 'A **guest** and any **users** can search for product(s) that contains a **brand**, a **category** or a **partial or full product name**.'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all available products that matches the search keyword. If no products are found, an **empty array** will be returned', schema: {$ref: '#/definitions/productsSearchSuccess'} }
  #swagger.responses[400] = { description: 'This response is returned when the body is missing the **search** property or if it\'s an **invalid** value', schema: {$ref: '#/definitions/productsSearchUserError'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while is trying to get all available products with the provided keyword', schema: {$ref: '#/definitions/productsSearchInternalError'} }
  */
  const { search } = req.body;
  const expectedType = { search: 'string' };
  const expectedProperty = [ 'search' ];


  utils.validateRequiredProperties(req.body, expectedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  const products = await productService.search(search, req);
  return res.status(200).jsend.success({ statusCode: 200, result: products.length > 0 ? 'Successfully found products' : 'No products found', products: products, recordsFound: products.length });
}))

router.post('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
#swagger.tags = ['Products']
#swagger.description = 'An **admin** can create a new product'
#swagger.parameters['body'] = {in: 'body', description: 'All **required** properties for the creation of a product', schema: {name: 'A product name', description: 'A product description', unitprice: 399, quantity: 10, CategoryId: 2, BrandId: 1}, required: true}
#swagger.responses[200] = { description: 'This response is returned when the API successfully creates a new products', schema: {$ref: '#/definitions/productsPostSuccess'}}
#swagger.responses[400] = { description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body. This response can also occur when there\'s a **missing property**', schema: {$ref: '#/definitions/productsPostUserError'}} 
#swagger.responses[404] = { description: 'This response is returned when the **admin** user has provided a **category id** or a **brand id** that the API can\'t find', schema: {$ref: '#/definitions/productsPostNotFound'}} 
#swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
#swagger.responses[409] = { description: 'This response is returned when the product name is identical to a product that already exists', schema: {$ref: '#/definitions/productsPostConflict'}} 
#swagger.responses[500] = { description: 'This response is returned when  an **internal server error** occurrs while the API is trying to create a product', schema: {$ref: '#/definitions/productsPostInternalError'}}
#swagger.security = [{adminAuth: []}]
*/
  const { name, description, unitprice, quantity, imgurl, BrandId, CategoryId } = req.body;
  const expectedProperties = [ 'name', 'description', 'unitprice', 'imgurl', 'quantity', 'BrandId', 'CategoryId' ];
  const expectedTypes = { name: 'string', description: 'string', unitprice: 'number', quantity: 'number', imgurl: 'url', BrandId: 'number', CategoryId: 'number' };

  utils.validateRequiredProperties(req.body, expectedProperties);
  utils.validateVariableTypes(req.body, expectedTypes);

  await productService.create(name, description, unitprice, quantity, imgurl, BrandId, CategoryId);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully created product' })
}))

router.get('/deleted', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Products']
  #swagger.description = 'An **admin** can retrieve all **deleted** products'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves only the **deleted** products. If no deleted products are found, an **empty array** will be returned', schema: {$ref: '#/definitions/productsGetDeletedSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
  #swagger.responses[500] = { description: 'This response is returned when  an **internal server error** occurrs while the API is trying to get all **deleted** products', schema: {$ref: '#/definitions/productsGetDeletedInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const deleted = await productService.getDeleted();
  return res.status(200).jsend.success({ statusCode: 200, result: deleted.length > 0 ? 'Successfully found deleted products' : 'No deleted products found', deleted: deleted });
}))

router.put('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
 #swagger.tags = ['Products']
 #swagger.description = 'An **admin** can update any product'
 #swagger.parameters['body'] = {in: 'body', description: 'The available properties an **admin** can use for updating a product. At least **one** property must be present in the body', schema: {name: 'A product name', description: 'Product description', unitprice: 499, quantity: 10, imgurl: 'https://some.url.com/exampleImage.png', BrandId: 1, CategoryId: 2 }, required: true}
 #swagger.parameters['id'] = { description: 'The product id', required: true }
 #swagger.responses[200] = { description: 'This response is returned when the API successfully updates a product', schema: {$ref: '#/definitions/productsUpdateSuccess'}}
 #swagger.responses[400] = { description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body. ', schema: {$ref: '#/definitions/productsUpdateUserError'}} 
 #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
 #swagger.responses[404] = { description: 'This response is returned when the API can\'t find a product with the provided id, or is unable to find the brand or the category with their id if provided', schema: {$ref: '#/definitions/productsUpdateNotFound'}}
 #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to update a product', schema: {$ref: '#/definitions/productsUpdateInternalError'}}
 #swagger.security = [{adminAuth: []}]
 */
  const { name, description, unitprice, quantity, imgurl, isdeleted, BrandId, CategoryId } = req.body;
  const expectedTypes = { name: 'string', description: 'string', unitprice: 'number', quantity: 'number', imgurl: 'url', BrandId: 'number', CategoryId: 'number', isdeleted: 'number' };
  const acceptedProperties = [ 'name', 'description', 'unitprice', 'quantity', 'imgurl', 'isdeleted', 'BrandId', 'CategoryId' ];

  utils.validateAcceptedProperties(req.body, acceptedProperties)
  utils.validateVariableTypes(req.body, expectedTypes);

  await productService.update(req.params.id, name, description, unitprice, quantity, imgurl, isdeleted, BrandId, CategoryId);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated product' });
}))

router.delete('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Products']
  #swagger.description = 'An **admin** can delete any product'
  #swagger.parameters['id'] = { description: 'The product id', required: true }
  #swagger.responses[200] = { description: 'This response is returned when the API successfully deletes a product', schema: {$ref: '#/definitions/productsDeleteSuccess'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
  #swagger.responses[404] = { description: 'This response is returned when the API can\'t find a product with the provided id for deletion', schema: {$ref: '#/definitions/productsDeleteNotFound'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to delete a product', schema: {$ref: '#/definitions/productsDeleteInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  await productService.delete(req.params.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully deleted product' });
}))


module.exports = router;