module.exports = (err, req, res, next) => {
  console.error(err);
  res.setHeader('Content-Type', 'application/json');

  if (err.status && err.status !== 500) {
    let filteredArgs = null;
    if (err.args)
      filteredArgs = Object.assign({}, ...err.args.filter(arg => typeof arg === 'object' && arg !== null));
    return res.status(err.status).jsend.fail({ statusCode: err.status, result: err.message, error: err.name, ...filteredArgs })
  }

  else return res.status(500).jsend.error({ statusCode: 500, message: err.message });
}