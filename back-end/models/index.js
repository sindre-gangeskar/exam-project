const path = require('path');
const fs = require('fs');
const basename = path.basename(__filename);

const connection = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
  host: process.env.HOST,
  port: process.env.DB_PORT
};
const Sequelize = require('sequelize');
const sequelize = new Sequelize(connection);
const db = {};

db.sequelize = sequelize;

fs.readdirSync(__dirname)
  .filter(file => { return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js') })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize)
    db[ model.name ] = model;
  })

Object.keys(db).forEach(modelName => {
  if (db[ modelName ].associate)
    db[ modelName ].associate(db);
})

module.exports = db;