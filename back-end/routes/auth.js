var express = require('express');
var router = express.Router();

const db = require('../models');
const utils = require('../javascripts/utils');
const auth = require('../javascripts/auth');
const { isAuth } = require('../middleware/auth');

const UserService = require('../services/UserService');
const userService = new UserService(db);

const asyncHandler = require('../middleware/asyncHandler');

router.post('/register', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Authorization']
  #swagger.description = 'A **guest** can sign up for the service and log in with the **Username** or **Email** the user provides during registration'
  #swagger.parameters['body'] = {in: 'body', description: 'All required properties for the creation of a user', schema: {$username: 'johndoe', $firstname: 'John', $lastname: 'Doe', $email: 'johndoe@email.com', $phone: '1234567890', $address: 'John Doe Homestreet 15A'}, required: true}
  #swagger.responses[200] = { description: 'This response is returned when the API successully creates a user', schema: {$ref: '#/definitions/authPostSignupSuccess'}}
  #swagger.responses[400] = { description: 'This response is returned when the **user** provides incorrect or invalid values in the body', schema: {$ref: '#/definitions/authPostSignupUserError'}}
  #swagger.responses[409] = { description: 'This response is returned when the user provides an **email** or a **username** that an existing user already uses', schema: {$ref: '#/definitions/authPostSignupConflict'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to create a user', schema: {$ref: '#/definitions/authPostSignupInternalError'}}
  */
  const { username, firstname, lastname, email, address, phone, password } = req.body;
  const expectedProperties = [ 'username', 'firstname', 'lastname', 'email', 'address', 'phone', 'password' ];
  const expectedTypes = { username: 'string', firstname: 'string', lastname: 'string', email: 'email', address: 'string', phone: 'phone', password: 'string' }

  utils.validateRequiredProperties(req.body, expectedProperties)
  utils.validateVariableTypes(req.body, expectedTypes);

  await userService.create(username, password, email, firstname, lastname, address, phone);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Successfully created user' })
}))
router.post('/login', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Authorization']
  #swagger.description = 'A guest can log in to a **registered** account with **Username** or **Email**'
  #swagger.responses[200] = { description: 'This response is returned when the user successully logs in', schema: {$ref: '#/definitions/authPostLoginSuccess'}}
  #swagger.responses[400] = { description: 'This response is returned when the user has provided incorrect or invalid values or properties in the body', schema: {$ref: '#/definitions/authPostLoginUserError'}}
  #swagger.responses[404] = { description: 'This response is returned when the API fails to find user with provided **username** or **email**', schema: {$ref: '#/definitions/authPostLoginNotFound'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** while the API is trying to find user data', schema: {$ref: '#/definitions/authPostLoginInternalError'}}
  #swagger.parameters['body'] = { in: 'body', description: 'User credentials for logging in. The API accepts either the **username** or **email**, and allows the user to choose which to use as it doesn\'t require both to be in the body.', schema: {$username: 'johndoe', $password: 'secret', email: 'johndoe@email.com'}, required: true}
  */

  /* The password is checked here, if the validation succeeds, this function will return a signed token and the decoded user data */
  const { token, user } = await auth.validateCredentialsAndSignToken(req.body);
  return res.status(200).jsend.success({ statusCode: 200, result: 'Login successful!', token: token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}))
router.get('/verify-role', isAuth, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Authorization']
  #swagger.description = 'A logged in **user** can fetch the role it has - very useful when you want to make sure the user has an admin role for example.'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully return the role the user is assigned', schema: {$ref: '#/definitions/authGetRoleCheckSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/unauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** while the API is trying to read the token and its data', schema: {$ref: '#/definitions/authGetRoleInternalError'}}
  #swagger.security = [{userAuth: []}, {adminAuth: []}]
  */
  const token = await auth.getToken(req);
  const decoded = auth.getDecodedToken(token);

  return res.status(200).jsend.success({ statusCode: 200, result: 'Role check successful', role: decoded.role })
}))

module.exports = router;
