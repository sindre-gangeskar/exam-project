const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 31000, 64, 'sha256');

  return { hashedPassword, salt };
}
function testEmail(email) {
  /* 
  This regex checks if the string being tested follows an email format.

  It accepts any email with a dot, underscore or a dash in the local part and any extra amounts of local parts. It expects at least one
  local part to exist in the string. 

  Examples:
  sindre@email.com
  sindre.gangeskar@email.com
  sindre.gangeskar2710@email.com
  sindre.gangeskar.noroff@school.co.uk

  The regex is case insensitive
  */
  const emailRegex = /^(?<local>[a-z]+(?:[\.\_\-a-z][a-z0-9]+)*)@[a-z]+[.][a-z]+(?:[.][a-z]+)*?$/i

  if (typeof email !== 'string')
    return false;

  if (!emailRegex.test(email))
    return false;

  return email;
}
function testPhoneNumber(phoneNumber) {
  /* 
   I made this regex to check that only numbers are passed in.
   It also allows for white-spaces, but it'll remove all white-spaces after validation for insertion into the database
  */
  const phoneRegex = /^[0-9\s]+$/

  /* If the value provided isn't of type string, return false */
  if (typeof phoneNumber !== 'string')
    return false;

  /* Remove all white-spaces the user could potentially have included in the body input for phone number */
  phoneNumber = phoneNumber.replace(/\s+/g, '');

  /* Return false if the value fails the regex test */
  if (!phoneRegex.test(phoneNumber))
    return false;

  return phoneNumber;
}
function validateVariableTypes(data, expectedTypes) {
  Object.entries(data).forEach(([ key, value ]) => {
    const expectedType = expectedTypes[ key ];

    if (expectedType === 'string' && (typeof value !== 'string' || value === ''))
      createAndThrowError(400, `${key} must be a non-empty string`, `InvalidStringError`);
    
    if (expectedType === 'url' && (typeof value !== 'string'))
      createAndThrowError(400, `${key} must be a string`, `InvalidStringError`);

    if (expectedType === 'number' && typeof value !== 'number')
      createAndThrowError(400, `${key} must be a number`, `InvalidNumberError`)

    if (expectedType === 'email' && !testEmail(value))
      createAndThrowError(400, `${key} must be a non-empty string which follows the correct email format, e.g example@email.com`, 'InvalidEmailError');

    if (expectedType === 'phone' && !testPhoneNumber(value))
      createAndThrowError(400, `${key} must be a non-empty string with numbers only (spaces allowed)`, 'InvalidPhoneError');


    return true;
  })
}
function validateRequiredProperties(body, requiredProperties) {
  let missingProperties = [];
  let invalidProperties = [];

  /* Check for missing required properties in the body */
  for (const property of requiredProperties) {
    if (!body.hasOwnProperty(property))
      missingProperties.push(property);
  }
  /* Check for invalid properties */
  for (const property in body) {
    if (!requiredProperties.includes(property))
      invalidProperties.push(property);
  }

  if (missingProperties.length > 0) {
    console.log(missingProperties);
    createAndThrowError(400, 'Required properties are missing', 'MissingPropertyError', { missingInBody: missingProperties });
  }

  else if (invalidProperties.length > 0)
    createAndThrowError(400, 'Please remove invalid properties', 'InvalidPropertyError', { invalidProperties: invalidProperties });
}
function validateAcceptedProperties(body, validProperties) {
  let invalidProperties = [];

  /* Check for invalid properties  */
  for (const property in body) {
    if (!validProperties.includes(property))
      invalidProperties.push(property);
  }

  if (invalidProperties.length > 0) {
    createAndThrowError(400, 'Please remove invalid properties', 'InvalidPropertyError', { invalidProperties: invalidProperties })
  }

  if (Object.entries(body).length === 0)
    createAndThrowError(400, `At least one property must be present`, 'BodyEmptyUserError', { validProperties: validProperties });
}
function createAndThrowError(statusCode, message, errorName, ...args) {
  const error = new Error(message);
  error.status = statusCode;
  error.name = errorName || 'InternalServerError';
  args.length > 0 ? error.args = args : null;
  throw error;
}

module.exports = { hashPassword, testPhoneNumber, createAndThrowError, validateVariableTypes, validateRequiredProperties, validateAcceptedProperties };