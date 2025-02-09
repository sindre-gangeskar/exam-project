const Server = require('../javascripts/server');
const server = new Server();

const utils = require('../javascripts/utils');
module.exports = ({
  isAuth: async (req, res, next) => {
    try {
      /* Get the role that's returned by the back-end api to verify if the role is Admin */
      const { data: { role } } = await server.fetch(req, res, 'auth/verify-role', 'get');
      if (role === 'Admin') next();
      else utils.createAndThrowError(401, 'Admin privileges required', 'UnauthorizedError');
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
})