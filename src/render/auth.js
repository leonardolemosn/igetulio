const loginPage = function (req, res) {
  const username = req.flash('user').join('') || '';
  const error = req.flash('error').join('');

  return res.render('pages/login', { username, error });
};

const registerPage = function (req, res, next) {
  const user = req.flash('user')[0] || {};
  const error = req.flash('error').join('');

  res.render('pages/register', { user, error });
};

const forgotPasswordPage = function (req, res, next) {
  const user = req.flash('user')[0] || {};
  const error = req.flash('error').join('');

  res.render('pages/forgot-password', { user, error });
};

module.exports = {
  loginPage,
  registerPage,
  forgotPasswordPage
};
