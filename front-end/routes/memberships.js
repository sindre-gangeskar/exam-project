const express = require('express');
const router = express.Router();

const Server = require('../javascripts/server');
const server = new Server();

const asyncHandler = require('../middleware/asyncHandler');

const { isAuth } = require('../middleware/auth');


router.get('/', isAuth, asyncHandler(async function (req, res, next) {
  const { data: { memberships } } = await server.fetch(req, res, 'memberships', 'get');
  return res.status(200).render('memberships', { memberships: memberships, title: 'Memberships' });
}))

module.exports = router;