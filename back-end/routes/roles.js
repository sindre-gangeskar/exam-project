const express = require('express');
const router = express.Router();

const db = require('../models');
const { isAuth, isAdmin } = require('../middleware/auth');

const asyncHandler = require('../middleware/asyncHandler');

const RoleService = require('../services/RoleService');
const roleService = new RoleService(db);

router.get('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Roles']
  #swagger.description = 'An **admin** can retrieve all roles available'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all available roles. If no roles are found, an **empty array** will be returned' , schema: {$ref: '#/definitions/rolesGetSuccess'}}
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}} 
  #swagger.responses[500] = { description: 'This response is returned when **an internal server error** occurrs while the API is trying to retrieve all roles', schema: {$ref: '#/definitions/rolesGetInternalError'}}
  #swagger.security = [{adminAuth: []}]
  */
  const roles = await roleService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: roles.length > 0 ? 'Successfully found roles' : 'No roles found', roles: roles });
}))


module.exports = router;