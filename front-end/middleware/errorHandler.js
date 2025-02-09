module.exports = (err, req, res, next) => {
  console.error(`${req.method}: ${req.path}`, err);

  const tokenErrors = [ 'InvalidJWTError', 'TokenExpiredError', 'UnauthorizedError' ]
  const credentialErrors = [ 'InvalidCredentialsError', 'MissingCredentialsError' ];
  const invalidValueErrors = [ 'InvalidStringError', 'InvalidNumberError', 'InvalidPhone', 'InvalidEmailError', 'InvalidURLError' ]
  const dependencyErrors = [ 'CategoryDependencyError', 'BrandDependencyError' ];
  const stockErrors = [ 'StockOutOfRangeError' ];
  const duplicateErrors = [ 'DuplicateRecordError' ];
  const userErrors = [ 'UserNotFoundError' ];

  if (tokenErrors.includes(err.name)) {
    return res.status(err.status).render('login', { message: err.message, statusCode: err.status });
  }

  if (req.accepts('json')) {
    if (res.status === 'fail'
      || credentialErrors.includes(err.name)
      || userErrors.includes(err.name)
      || dependencyErrors.includes(err.name)
      || duplicateErrors.includes(err.name)
      || invalidValueErrors.includes(err.name)
      || stockErrors.includes(err.name))
      return res.status(err.status).json({ status: 'fail', data: { statusCode: err.status, result: err.message, error: err.name } });

    else return res.status(500).json({ status: 'error', data: { statusCode: 500, result: err.message || 'An internal server error has occurred', error: err.name || 'InternalServerError' } });
  }

  return next(err);
}
