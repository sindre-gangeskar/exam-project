const express = require('express');
const router = express.Router();

const Server = require('../javascripts/server');
const server = new Server();

const utils = require('../javascripts/utils');
const asyncHandler = require('../middleware/asyncHandler');


router.get('/', function (req, res, next) {
  return res.status(200).render('login', { message: null });
})

router.post('/login', asyncHandler(async function (req, res, next) {
  const { username, password } = req.body;
  const body = { username: username, email: username, password: password };
  const response = await server.fetch(req, res, 'auth/login', 'post', body);

  const token = response.data.token;
  const user = response.data.user;

  if (response.status === 'fail')
    return utils.createAndThrowError(response.data.statusCode, response.data.result, response.data.error);

  if (user.role === 'Admin') {
    req.session.user = user;
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' ? true : false, sameSite: 'lax' })
    return res.status(response.data.statusCode).json({ status: 'success', data: { statusCode: 200, result: 'Successfully logged in!' } });
  }
  else return res.status(401).json({ status: 'fail', data: { statusCode: 401, result: 'Admin privileges required', error: 'AdminRequiredError' } })
}))

router.post('/signout', asyncHandler(async function (req, res, next) {
  req.session.destroy(err => {
    if (err) console.error(err);
    else {
      res.clearCookie('token');
      res.clearCookie('connect.sid');
      return res.status(200).redirect('/');
    }
  });
}))

router.post('/initialize', asyncHandler(async function (req, res, next) {
  const response = await server.fetch(req, res, 'init', 'post');
  return res.status(response.data.statusCode).json(response);
}))

module.exports = router;