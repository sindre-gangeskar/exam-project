const utils = require('../javascripts/utils');
const auth = require('../javascripts/auth');

module.exports = ({
  isAuth: (req, res, next) => {
    try {
      if (auth.verifyToken(req, res, next)) return next();
      else utils.createAndThrowError(401, 'Login required', 'UnauthorizedError');
    }
    catch (error) {
      console.error(error);
      if (error.status) throw (error);
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to verify account credentials', 'InternalVerifyAccountCredentialsError');
    }
  },
  isAdmin: (req, res, next) => {
    if (req.user && req.user.role == 'Admin') return next();
    else utils.createAndThrowError(401, 'Admin privileges required', 'UnauthorizedError');
  },
  checkRole: (req, res, next) => {
    const header = req.headers[ 'authorization' ];
    if (header && header.startsWith('Bearer')) {
      const token = header.split(' ')[ 1 ];

      const decoded = auth.getDecodedToken(token);
      if (decoded) req.user = decoded;
      return next();
    }
    else return next();
  }
})