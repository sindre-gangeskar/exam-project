const utils = require('./utils');

class Server {
  fetch = async function (req, res, endpoint, method, body = null) {
    try {
      const response = await fetch(`${process.env.BACKEND_HOST}/${endpoint}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(req.cookies.token ? { Authorization: `Bearer ${req.cookies.token}` } : {}),
        },
        method: method.toUpperCase().trim(),
        ...(body ? { body: JSON.stringify(body) } : null),
        credentials: 'include'
      })
      let data;
      if (response.headers.get('content-type')?.includes('application/json')) {
        data = await response.json();
      } else data = response;

      if (response.ok) return data;
      else return utils.createAndThrowError(data?.data.statusCode, data.data.result, data.data.error)
    } catch (error) {
      console.error(error);
      if (error.status)
        return utils.createAndThrowError(error.status, error.message, error.name);

      else if (error[ 'cause' ]?.code?.includes('ECONNREFUSED'))
        return utils.createAndThrowError(500, 'Could not establish a connection to the back-end server', 'APIConnectionError');

      else return utils.createAndThrowError(500, 'An internal server error has occurred while trying to fetch to the back-end API', 'InternalServerError');
    }
  }
}

module.exports = Server;