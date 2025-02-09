var express = require('express');
var router = express.Router();

const Server = require('../javascripts/server');
const server = new Server();

const utils = require('../javascripts/utils');
const { isAuth } = require('../middleware/auth');

const asyncHandler = require('../middleware/asyncHandler');

router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { roles } } = await server.fetch(req, res, 'roles', 'get');
  const { data: { users } } = await server.fetch(req, res, 'users', 'get');

  users.forEach(user => {
    user.createdAt = utils.formatDate(user.createdAt)
    user.updatedAt = utils.formatDate(user.updatedAt)
  });
  const admins = users.filter(x => x.role === 'Admin');
  return res.status(200).render('users', { users: users, roles: roles, title: 'Users', admins: admins });
}));

router.put('/:id', isAuth, asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, `users/${req.params.id}`, 'put', req.body);
  return res.status(response.data.statusCode).json(response);
}))

module.exports = router;
