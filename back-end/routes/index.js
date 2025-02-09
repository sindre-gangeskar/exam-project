var express = require('express');
var router = express.Router();

const db = require('../models');

const DatabaseService = require('../services/DatabaseService');

const databaseService = new DatabaseService(db);
const asyncHandler = require('../middleware/asyncHandler');

/* GET home page. */
router.get('/', function (req, res, next) {
  /* 
  #swagger.tags = ['Index']
  #swagger.description = 'Home for the exam project of Sindre Gangeskar'
  #swagger.responses[200] = { description: 'This response is returned if the API successfully reaches the index endpoint', success: {statusCode: 200, result: 'Welcome to the exam project for Sindre Gangeskar'}}
  #swagger.produces = ['application/json']
  */
  return res.status(200).jsend.success({ statusCode: 200, result: 'Welcome to the exam project for Sindre Gangeskar' })
});

router.post('/init', asyncHandler(async function (req, res, next) {
  /* 
  #swagger.tags = ['Database Initialization']
  #swagger.description = 'Initialize the database with initial data fetched from the CA API
  #swagger.responses[200] = {description: 'This response is returned when the database is already populated', schema: {$ref: '#/definitions/initDBPopulated'}}
  #swagger.responses[201] = {description: 'This response is returned when the API successfully populates the database', schema: {$ref: '#/definitions/initDBSuccess'}}
  #swagger.responses[500] = {description: 'This response is returned when **internal server error** occurrs while the API is trying to populate initial data to the database', schema: {$ref: '#/definitions/initDBInternalError'}}
  */

  const isPopulated = await databaseService.isPopulated();
  if (isPopulated)
    return res.status(200).jsend.success({ statusCode: 200, result: 'Database is already populated with initial data' });

  let productsArr = [];
  let categoriesArr = [];
  let brandsArr = [];

  const response = await fetch('http://backend.restapi.co.za/items/products', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  /* Using sets to avoid duplicates when getting all brands and categories  */
  if (response && response.ok) {
    const products = await response.json();
    productsArr = products.data;
    categoriesArr = [ ...new Set(productsArr.map(x => (x.category))) ].map(x => ({ name: x }));
    brandsArr = [ ...new Set(productsArr.map(x => (x.brand))) ].map(x => ({ name: x }))
  }
  await databaseService.populate(categoriesArr, brandsArr, productsArr);
  return res.status(201).jsend.success({ statusCode: 201, result: 'Successfully populated database with initial data' });
}))

module.exports = router;