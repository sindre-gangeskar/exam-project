const utils = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const db = require('../models');
const UserService = require('../services/UserService');
const userService = new UserService(db);

async function validateCredentialsAndSignToken(body) {
  try {
    const { username, email, password } = body;
    const expectedTypes = { username: 'string', password: 'string', email: 'string' };

    if (!username && !email || username == '' || email == '') return utils.createAndThrowError(400, 'username or email is required and must be a non-empty string', 'MissingCredentialsError');
    if (!password || password == '') return utils.createAndThrowError(400, 'password is required and must a be non-empty string', 'MissingCredentialsError');

    utils.validateVariableTypes(body, expectedTypes);
    const user = await userService.getOne(username, email);

    if (user) {
      const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 31000, 64, 'sha256')
      if (!crypto.timingSafeEqual(user.password, hashedPassword))
        return utils.createAndThrowError(401, 'Invalid credentials, please try again', 'InvalidCredentialsError');
      const token = jwt.sign({ id: user.id, name: `${user.firstname} ${user.lastname}`, email: user.email, role: user.Role.dataValues.name }, process.env.TOKEN_SECRET, { expiresIn: '2hrs' });
      const decoded = jwt.decode(token);
      return { token: token, user: decoded };
    }
    else return false;
  } catch (error) {
    console.error(error);
    if (error.status) throw (error);
    else return utils.createAndThrowError(500, 'An internal server error has occurred while trying to validate and sign token', 'InternalValidateCredentialsError');
  }
}
function verifyToken(req) {
  try {
    const token = getToken(req);
    if (token) {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET)
      if (verified) {
        const decoded = jwt.decode(token);
        req.user = decoded;
        return true;
      }
      else return false;
    }
    else return false;
  } catch (error) {
    console.error(error);
    if (error.statusCode) throw error;

    if (error.name == 'TokenExpiredError')
      utils.createAndThrowError(401, 'Session has expired, please log in again', error.name);
    else if (error.name === 'JsonWebTokenError') utils.createAndThrowError(401, 'Invalid token, please log in again', 'InvalidJWTError');
    else utils.createAndThrowError(500, 'An internal server error has occurred while trying to verify token', 'JWTVerifyError');
  }
}
function getToken(req) {
  try {
    const header = req.headers[ 'authorization' ];
    if (header && header.startsWith('Bearer')) {
      const token = header.split(' ')[ 1 ];
      return token;
    }
    else return null;
  } catch (error) {
    console.error(error);
    utils.createAndThrowError(500, 'An internal server error has occurred while trying to get token', 'JWTGetError')
  }
}
function getDecodedToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error(error);
    utils.createAndThrowError(500, 'An internal server error has occurred while trying to read token payload', 'JWTReadError')
  }
}

module.exports = { validateCredentialsAndSignToken, verifyToken, getToken, getDecodedToken };