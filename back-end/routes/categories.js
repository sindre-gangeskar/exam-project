const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { isAuth, isAdmin } = require('../middleware/auth');
const utils = require('../javascripts/utils');

const db = require('../models');
const CategoryService = require('../services/CategoryService');
const categoryService = new CategoryService(db);

router.get('/', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Categories']
  #swagger.description = 'Anyone can view the categories that currently exist'
  #swagger.responses[200] = {description: 'This response is returned when the API successfully retrieves all categories. If no categories are found, an **empty array** will be returned', schema: {$ref: '#/definitions/categoriesGetSuccess'}}
  #swagger.responses[500] = {description: 'This response is returned when an internal server error occurrs while the API is trying to get all products', schema: {$ref: '#/definitions/categoriesGetInternalError'}}
  */
  const categories = await categoryService.getAll();
  return await res.status(200).jsend.success({ statusCode: 200, result: categories.length > 0 ? 'Successfully found categories' : 'No categories found', categories: categories });
}))
router.post('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Categories']
  #swagger.parameters['body'] = {in: 'body', description:'The **name** property is required in order to create a category', schema: {name: 'category name'}, required: true}
  #swagger.description = 'An **admin** can create new categories for products to use'
  #swagger.responses[200] = {description: 'This response is returned when the API successfully creates a new category', schema: {$ref: '#/definitions/categoriesPostSuccess'}}
  #swagger.responses[400] = {description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/categoriesPostUserError'}}
  #swagger.responses[401] = {description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[409] = {description: 'This response is returned when **admin** provides a category name that an existing category is already using', schema: {$ref: '#/definitions/categoriesPostConflict'}}
  #swagger.responses[500] = {description: 'This response is returned when an **internal server error** occurrs while the API is trying to create a new category', schema: {$ref: '#/definitions/categoriesPostInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const { name } = req.body;
  const expectedType = { name: 'string' };
  const expectedProperty = [ 'name' ];

  utils.validateRequiredProperties(req.body, expectedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await categoryService.create(name);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully created category' });
}))
router.put('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Categories']
  #swagger.description = 'An **admin** can update a category\'s name'
  #swagger.parameters['id'] = { description: 'The category id', required: true}
  #swagger.parameters['body'] = {in: 'body', description: 'The **name** property is required in order to update a category\'s name', schema: {name: 'A different category name'}, required: true}
  #swagger.responses[200] = {description: 'This response is returned when the API successfully updates a category\'s name', schema: {$ref: '#/definitions/categoriesUpdateSuccess'}}
  #swagger.responses[400] = {description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/categoriesUpdateUserError'}} 
  #swagger.responses[401] = {description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
  #swagger.responses[404] = {description: 'This response is returned when the API can\'t find a category with the provided id', schema: {$ref: '#/definitions/categoriesUpdateNotFound'}} 
  #swagger.responses[500] = {description: 'This response is returned when an **internal server error** has occurred while the API is trying to update a category', schema: {$ref: '#/definitions/categoriesUpdateInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const { name } = req.body;
  const expectedType = { name: 'string' };
  const expectedProperty = [ 'name' ];

  utils.validateAcceptedProperties(req.body, expectedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await categoryService.update(req.params.id, name);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated category' });
}))
router.delete('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Categories']
  #swagger.description = 'An **admin** can delete a category'
  #swagger.parameters['id'] = { description: 'The category id', required: true}
  #swagger.responses[200] = {description: 'This response is returned when the API successfully deletes a category', schema: {$ref: '#/definitions/categoriesDeleteSuccess'}}
  #swagger.responses[401] = {description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[404] = {description: 'This response is returned when the API can\'t find a category with the provided id', schema: {$ref: '#/definitions/categoriesDeleteNotFound'}}
  #swagger.responses[409] = {description: 'This response is returned when the API fails to delete because a product or several are using the category **admin** wants to delete', schema: {$ref: '#/definitions/categoriesDeleteConflict'} }
  #swagger.responses[500] = {description: 'This response is returned when an **internal server error** occurrs while the API is trying to delete a category', schema: {$ref: '#/definitions/categoriesDeleteInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  await categoryService.delete(req.params.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully deleted category' });
}))

module.exports = router;
