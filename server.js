// load the things we need
require('dotenv').config();

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const jwt = require('express-jwt');
const flash = require('connect-flash');
const session = require('express-session');

const routes = require('./src/routes');
const { COOKIES_OPTS } = require('./src/util/constants');
const UserSchema = require('./src/models/user');

const opts = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(process.env.DB_URI, opts);

// set the view engine to ejs
app.set('view engine', 'ejs');

// middlewares

// app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(session({
//   resave: false, // don't save session if unmodified
//   saveUninitialized: false, // don't create session until something stored
//   secret: 'shhhh, very secret'
// }));

app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());
app.use(jwt({
  secret: process.env.SECRET_TOKEN, getToken: function (req) {
    let token = null;
    if (req.session && req.session.token) {
      console.log('possui session e possui session.token');
      token = req.session.token;
    }

    return token;
  }

}).unless({ path: ['/online', '/recover-password', '/forgot-password', '/login', '/signin', '/register', '/signup', '/payment/notification', /\/css*/, /\/images*/, /\/docs*/] }));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true, limit: '150mb', parameterLimit: 1000000 }));
app.use(bodyParser.json());
app.use(express.static('views/public'));

app.use(async function (req, res, next) {
  if (req.path != '/analysis' && req.user && (await UserSchema.findById(req.user._id)).active === false) {
    return res.redirect('/analysis');
  }
  return next();
});

app.use(function (err, req, res, next) {
  console.log('----------------- Middleware de erro');
  if (err.name === 'UnauthorizedError') {
    console.log('UnauthorizedError');
    req.session.destroy(function () {
      console.log('limpando session');
      console.log('redirect para login');
      return res.redirect('/login');
    });
    // return res.redirect('/login');
  }
  // console.log('Algum outro erro');
  // console.log(err.name);
  // return res.render('pages/error');
});

// define routes
routes(app);

app.listen(process.env.PORT || 3000, '0.0.0.0', (err) => {
  if (err) console.error(err);
  console.log('estoy listo on port: 3000. Base URL OCR:' + process.env.OCR_BASE_URL);
});








