const express = require('express');
const router = express.Router();

const asyncHandler = require('../middleware/asyncHandler');

const db = require('../models');

const UserService = require('../services/UserService');
const userService = new UserService(db);

const { isAuth, isAdmin } = require('../middleware/auth');
const utils = require('../javascripts/utils');

router.get('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Users']
  #swagger.description = 'An **admin** can retrieve all existing users'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully finds all users regsitered. If no users are found, an **empty array** will be returned', schema: {$ref: '#/definitions/usersGetSuccess'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to get all users', schema: {$ref: '#/definitions/usersGetInternalError'} }
  #swagger.security = [{adminAuth: []}]
   */
  const users = await userService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: users.length > 0 ? 'Successfully found users' : 'No users found', users: users })
}))
router.get('/user/details', isAuth, asyncHandler(async function (req, res, next) {
  /*
    #swagger.tags = ['Users']
    #swagger.description = 'A logged in **user** can retrieve its own details'
    #swagger.responses[200] = { description: 'This response is returned when the API successfully finds user details for the logged in user', schema: {$ref: '#/definitions/userGetByIdSuccess'} }
    #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
    #swagger.responses[404] = { description: 'This response is returned when the API fails to find user details for the logged in user', schema: {$ref: '#/definitions/userGetByIdNotFound'} }
    #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to find user details for the logged in user', schema: {$ref: '#/definitions/userGetByIdInternalError'} }
    #swagger.security = [{userAuth: [], adminAuth: []}]
  */
  const user = await userService.getOneById(req.user.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully found user', user: user });
}))
router.get('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Users']
  #swagger.description = 'An **admin** can retrieve a user\'s details by id'
  #swagger.parameters['id'] = { description: 'The user id', required: true }
  #swagger.responses[200] = { description: 'This response is returned when the API successfully finds the user with the provided id', schema: {$ref: '#/definitions/userGetByIdSuccess'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API fails to find a user with the provided id', schema: {$ref: '#/definitions/userGetByIdNotFound'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to find a user with the provided id', schema: {$ref: '#/definitions/userGetByIdInternalError'} }
  #swagger.security = [{adminAuth: []}]
   */
  const user = await userService.getOneById(req.params.id);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully found user', user: user });
}))
router.put('/:id', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Users']
  #swagger.description = 'An **admin** can update a user\'s data'
  #swagger.parameters['id'] = { description: 'The user id', required: true }
  #swagger.parameters['body'] = {in: 'body', description: 'The available properties for updating a user\'s details', schema: { RoleId: 1, email: 'new@email.com', firstname: 'John', lastname: 'Smith', address: 'New address', phone: '123456789'}, required: true }
  #swagger.responses[200] = { description: 'This response is returned when the API successfully updates the user data', schema: {$ref: '#/definitions/userUpdateByIdSuccess'} }
  #swagger.responses[400] = { description: 'This response is returned when the **admin** user provides incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/userUpdateByIdUserError'}}
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[404] = { description: 'This response is returned when the API fails to find a user with the provided user id, or role id', schema: {$ref: '#/definitions/userUpdateByIdNotFound'} }
  #swagger.responses[409] = { description: 'This response is returned when the user provides an **email** that is already in use by another user', schema: {$ref: '#/definitions/userUpdateByIdConflict'} }
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to find a user with the provided id', schema: {$ref: '#/definitions/userUpdateByIdInternalError'} }
  #swagger.security = [{adminAuth: []}]
   */
  const { firstname, lastname, email, address, phone, RoleId } = req.body;
  const expectedType = { RoleId: 'number', firstname: 'string', lastname: 'string', email: 'email', address: 'string', phone: 'phone' };
  const acceptedProperty = [ 'RoleId', 'firstname', 'lastname', 'email', 'address', 'phone' ];

  utils.validateAcceptedProperties(req.body, acceptedProperty);
  utils.validateVariableTypes(req.body, expectedType);

  await userService.update(req.params.id, RoleId, firstname, lastname, email, address, phone);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully updated user' });
}))


module.exports = router;