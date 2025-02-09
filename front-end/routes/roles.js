const express = require('express');
const router = express.Router();

const Server = require('../javascripts/server');
const server = new Server();

const { isAuth } = require('../middleware/auth');

const asyncHandler = require('../middleware/asyncHandler');

router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { roles } } = await server.fetch(req, res, 'roles', 'get');
  return res.status(200).render('roles', { roles: roles, title: 'Roles' });
}))

module.exports = router;