const UserSchema = require('../models/user');
const logger = require('../util/logger');
const { COOKIES_OPTS } = require('../util/constants');

const logOut = function (req, res, next) {
  // res.clearCookie('token', { ...COOKIES_OPTS, expires: null });
  req.session.destroy(function () {
    return res.redirect('/home');
  });  
};

const signIn = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    logger.debug(`Request data: ${username}`);
    req.flash('user', username);
    if (!username || !password) {
      logger.debug('Usuário e senha são obrigatórios!');
      req.flash('error', 'Usuário e senha são obrigatórios!');
      return res.redirect('/login');
    }

    let user = await UserSchema.findOne({ 'username': username });
    if (!user) {
      logger.debug('Usuário não encontrado!');
      req.flash('error', 'Usuário não encontrado!');
      return res.redirect('/login');
    }

    let isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.debug('Usuário ou senha inválidos!');
      req.flash('error', 'Usuário ou senha inválidos!');
      return res.redirect('/login');
    }

    const token = user.getJWTToken();

    req.session.regenerate(function () {
      req.session.token = token;
      return res.redirect('/home');
    })
    // res.cookie('token', token, COOKIES_OPTS);

    

  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const signUp = async function (req, res, next) {
  const reqUser = req.body;
  req.flash('user', reqUser);

  if (!reqUser.username || !reqUser.company || !reqUser.email || !reqUser.password || !reqUser.terms) {
    req.flash('error', 'Você precisa preencher todos os dados obrigatórios e aceitar os termos.');
    return res.redirect('/register');
  }

  const usernameExists = await UserSchema.exists({ username: reqUser.username });
  if (usernameExists) {
    req.flash('error', 'Nome de usuário já cadastrado.');
    return res.redirect('/register');
  }

  const emailExists = await UserSchema.exists({ email: reqUser.email })
  if (emailExists) {
    req.flash('error', 'E-mail já cadastrado.');
    return res.redirect('/register');
  }

  const user = new UserSchema(reqUser);

  await user.save();

  const token = user.getJWTToken();

  req.session.regenerate(function () {
    req.session.token = token;
    return res.redirect('/home');
  })
  // res.cookie('token', token, COOKIES_OPTS);
  
};

module.exports = {
  logOut,
  signIn,
  signUp,
};
