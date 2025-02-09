const express = require('express');
const router = express.Router();

const { isAuth, isAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const db = require('../models');
const StatusService = require('../services/StatusService');
const statusService = new StatusService(db);

router.get('/', isAuth, isAdmin, asyncHandler(async function (req, res, next) {
  /*
  #swagger.tags = ['Statuses']
  #swagger.description = 'An **admin** can retrieve all existing statuses'
  #swagger.responses[200] = { description: 'This response is returned when the API successfully finds all statuses. If no statuses are found, an **empty array** is returned', schema: {$ref: '#/definitions/statusesGetSuccess'} }
  #swagger.responses[401] = { description: 'This response is returned when the user lacks **admin** privileges or isn\'t logged in. The response will also be returned if the **session has expired** or the **token is invalid or malformed**', schema: {$ref: '#/definitions/adminUnauthorized'}}
  #swagger.responses[500] = { description: 'This response is returned when an **internal server error** occurrs while the API is trying to get all statuses', schema: {$ref: '#/definitions/statusesGetInternalError'} }
  #swagger.security = [{adminAuth: []}]
  */
  const statuses = await statusService.getAll();
  return res.status(200).jsend.success({ statusCode: 200, result: statuses.length > 0 ? 'Successfully found statuses' : 'No statuses found', statuses: statuses })
}))

module.exports = router;