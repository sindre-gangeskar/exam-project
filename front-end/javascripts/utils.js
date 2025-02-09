function createAndThrowError(statusCode, message, errorName = 'Error') {
  const error = new Error(message);
  error.name = errorName;
  error.status = statusCode;
  throw error;
}

function formatDate(isoString) {
  const formatted = isoString.split('T');
  const time = formatted[ 1 ].replace(/\.000Z$/, '')
  return `${formatted[ 0 ]} ${time}`
}

module.exports = { createAndThrowError, formatDate };

