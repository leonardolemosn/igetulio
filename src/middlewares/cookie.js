const checkExists = function (req, res, next) {
  if (req.cookies && req.cookies.token) {
    return res.redirect('/home');
  }

  next();
};

module.exports = {
  checkExists,
};