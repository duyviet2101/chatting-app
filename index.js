const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const moment = require('moment-timezone');
const { pushLogMorganToTelegram } = require('./middlewares/index.js');

const app = express();
const port = process.env.PORT || 3066;

//! socket io
const server = createServer(app);
const io = new Server(server);
global._io = io;
global._io.use(require('./middlewares/client/socketAuth.middleware.js'));
//! end socket io

//! middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
app.use(cookieParser((process.env.SECRET_KEY_COOKIE)));
app.use(session({
  secret: process.env.SECRET_KEY_SESSION,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60000 
  },
}));

// Tạo một token tùy chỉnh cho morgan để log địa chỉ IP
morgan.token('client-ip', (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // return ip === '::1' ? '127.0.0.1' : ip;
  return ip;
});

morgan.token('JSON', (req) => {
  const res = {
      query: req.query,
      params: req.params,
      body: req.body
  };
  return JSON.stringify(res);
})

// Tạo một format tùy chỉnh cho morgan
const format = 'IP::client-ip \n:method :url :status - :response-time ms\n\n:JSON\n';
app.use(morgan(format, {
  skip: (req, res) => {
      if (req.url.includes('/img') || req.url.includes('/css') || req.url.includes('/js') || req.url.includes('/bootstrap') || req.url.includes('/favicon.ico') || req.url.includes('/tinymce') || req.url.includes('/uploads') || req.url.includes('/fonts') || req.url.includes('/font') || req.url.includes('/jquery') || req.url.includes('/popper') || req.url.includes('/socket.io') || req.url.includes('/images')){
          return true;
      }
      return req.statusCode == 304;
  },
  stream: {
      write: pushLogMorganToTelegram,
      // write: (message) => {
      //     console.log(message);
      // }
  }
}))
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

//! locals
app.locals.moment = moment.tz.setDefault('Asia/Ho_Chi_Minh');
//! end locals

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
    // stack: error.stack
  })
});
//! end handle error

server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});