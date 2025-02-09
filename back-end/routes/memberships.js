const express = require('express');
const router = express.Router();

const db = require('../models');
const MembershipService = require('../services/MembershipService');
const membershipService = new MembershipService(db);

const asyncHandler = require('../middleware/asyncHandler');

const { isAuth, isAdmin } = require('../middleware/auth');

router.get('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Memberships']
  #swagger.description = 'An **admin** can retrieve all available memberships'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully retrieves all memberships. If no memberships are found, an **empty array** will be returned', schema: {$ref: '#/definitions/membershipsGetSuccess'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to retrieve all memberships', schema: {$ref: '#/definitions/membershipsGetInternalError'} }
  #swagger.security = [{adminAuth: []}]
  */
  const memberships = await membershipService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: memberships.length > 0 ? 'Successfully found memberships' : 'No memberships found', memberships: memberships });
}))

module.exports = router;