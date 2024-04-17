const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();
const port = process.env.PORT || 3066;

//! middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser((process.env.SECRET_KEY_COOKIE)));
app.use(session({
  secret: process.env.SECRET_KEY_SESSION,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60000 
  },
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
}, {
  function(accessTokenUser, refreshTokenUser, profile, done) {
    return done(null, profile);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, {
  function(accessTokenUser, refreshTokenUser, profile, done) {
    return done(null, profile);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());
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