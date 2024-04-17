const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');


const app = express();
const port = process.env.PORT || 3066;

//! middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
//! end middlewares

//! databases
const mongoDatabase = require('./databases/database.js');
//! end databases

//! view, static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//! end view, static files

//! method override
app.use(methodOverride('_method'));
//! end method override

//! flash
app.use(cookieParser((process.env.SECRET_KEY_COOKIE)));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// });
//! end flash

//! routes
app.use(require('./routes/client/index.route.js'))
//! end routes

//! handle error
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  console.log(error);
  res.render('404', {
    message: error.message,
  })
});
//! end handle error

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});