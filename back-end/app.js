require('dotenv').config();

var swaggerUI = require('swagger-ui-express');
var swaggerDoc = require('./swagger-output.json');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jsend = require('jsend');
const errorHandler = require('./middleware/errorHandler');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var productsRouter = require('./routes/products');
var cartRouter = require('./routes/cart');
var brandsRouter = require('./routes/brands');
var membershipsRouter = require('./routes/memberships');
var categoriesRouter = require('./routes/categories');
var ordersRouter = require('./routes/orders');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles');
var statusesRouter = require('./routes/statuses');

var app = express();

const db = require('./models');
db.sequelize.sync({ force: false });

app.use(jsend.middleware);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/brands', brandsRouter);
app.use('/memberships', membershipsRouter);
app.use('/categories', categoriesRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/statuses', statusesRouter);

app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDoc))
app.use(errorHandler);

module.exports = app;
