module.exports = function (req, res, next) {
  if (req.user.admin === true) {
    return next();
  }
  return res.redirect('/home');
};
