require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);

var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var productsRouter = require('./routes/products');
var brandsRouter = require('./routes/brands');
var categoriesRouter = require('./routes/categories');
var membershipsRouter = require('./routes/memberships');
var rolesRouter = require('./routes/roles');
var ordersRouter = require('./routes/orders');

var app = express();
var errorHandler = require('./middleware/errorHandler');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('./node_modules/bootstrap-icons'))

console.log(process.cwd());

const dbDir = path.join(__dirname, 'data');
const dataDirExists = fs.existsSync(dbDir);
if (!dataDirExists) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('created data directory ✅');
}
else console.log('data directory exists! 👍🏼');
app.use(session({
  store: new SQLiteStore({
    dir: dbDir,
    db: 'sessions.db',
    pruneSessionInterval: 1000 * 60 * 15,
  }),

  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production' ? true : false
  },
  rolling: true
}))

/* Makes the path and the user globally available for other views or partials to access */
app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.user = req.session.user;
  next();
})

app.use('/', authRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/brands', brandsRouter)
app.use('/memberships', membershipsRouter)
app.use('/roles', rolesRouter)
app.use('/orders', ordersRouter);
app.use(errorHandler);

//#region Error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  /* if (res.headersSent) return next(); */
  return next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (res.headersSent) return next();

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err) return res.render('error');
  // render the error page
  res.status(err.status || 500);
  return res.render('error');
});


//#endregion
module.exports = app;
