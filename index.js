const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const path = require('path');


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

//! routes
app.use(require('./routes/index.route.js'))
//! end routes

//! handle error
// app.use((req, res, next) => {
//   const error = new Error('Not found');
//   error.status = 404;
//   next(error);
// });

// app.use((error, req, res, next) => {
//   res.status(error.status || 500);
//   res.send({
//     error: {
//       status: error.status || 500,
//       message: error.message,
//     },
//   });
// });
//! end handle error

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});