const express = require('express');
const router = express.Router();

const db = require('../models');
const BrandService = require('../services/BrandService');
const brandService = new BrandService(db);

const { isAuth, isAdmin } = require('../middleware/auth');

const asyncHandler = require('../middleware/asyncHandler');

const utils = require('../javascripts/utils');

router.get('/', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Brands']
  #swagger.description = 'Any user can view all available brands'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all brands. If no brands are found, an **empty array** will be returned', schema: {$ref: '#/definitions/brandsGetSuccess'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to retrieve all available brands', schema: {$ref: '#/definitions/brandsGetInternalError'} }
  */
  const brands = await brandService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: brands.length > 0 ? 'Successfully found brands' : 'No brands found', brands: brands });
}))
router.delete('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Brands']
  #swagger.description = 'An **admin** can delete a brand'
  #swagger.parameters['id'] = { description: 'The brand id', required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successfully deletes a brand', schema: { $ref: '#/definitions/brandsDeleteSuccess' } }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API fails to find a brand with the provided id ', schema: {$ref: '#/definitions/brandsDeleteNotFound' } }
  #swagger.responses[409] = { description: 'This response is returned when the API fails to delete the brand because a product or several are using the brand **admin** wants to delete', schema: {$ref: '#/definitions/brandsDeleteConflict'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API attempts to delete a brand', schema: {$ref: '#/definitions/brandsDeleteInternalError'} }
  #swagger.security = [{adminAuth: []}]
  */
  await brandService.delete(req.params.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully deleted brand' });
}))
router.put('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Brands']
  #swagger.description = 'An **admin** can update a brand\'s name'
  #swagger.parameters['id'] = { description: 'The brand id', required: true}
  #swagger.parameters['body'] = {in: 'body', description: 'The **name** property is required in order to update a brand\'s name', schema: {$name: 'Another brand name'}, required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successfully updates a brand', schema: {$ref: '#/definitions/brandsUpdateSuccess'} }
  #swagger.responses[400] = { description: 'This response is returned when **admin** provides an invalid value', schema: {$ref: '#/definitions/brandsUpdateUserError'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[409] = { description: 'This response is returned when there\'s a conflict while trying to update the brand\'s name to something another brand is already using', schema: {$ref: '#/definitions/brandsUpdateConflict'} }
  #swagger.responses[500] = { description: 'This response is returned when an internal server occurrs while the API is trying to update brand', schema: {$ref: '#/definitions/brandsUpdateInternalError'} }
  #swagger.security = [{adminAuth: []}]
  */

  const { name } = req.body;
  const expectedType = { name: 'string' };
  const acceptedProperty = [ 'name' ];

  utils.validateAcceptedProperties(req.body, acceptedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await brandService.update(req.params.id, name)
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated brand' })
}))
router.post('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Brands']
  #swagger.description = 'An **admin** can create a new brand for products to use'
  #swagger.parameters['body'] = {in: 'body', description: 'The name property is **required** in order to create a brand', schema: {$name: 'Example Brand'}, required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successfully creates a new brand', schema: {$ref: '#/definitions/brandsPostSuccess'} }
  #swagger.responses[400] = { description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/brandsPostUserError'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[409] = { description: 'This response is returned when the API tries to create a brand, but another brand with the provided brand name already exists', schema: {$ref: '#/definitions/brandsPostConflict'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to create a new brand', schema: {$ref: '#/definitions/brandsPostInternalError'} }
  #swagger.security = [{adminAuth: []}]
  */
  const { name } = req.body;
  const expectedType = { name: 'string' };
  const expectedProperty = [ 'name' ];

  utils.validateRequiredProperties(req.body, expectedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await brandService.create(name)
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully created brand' });
}))

module.exports = router;