const UserSchema = require('../models/user');

const profilePage = async function (req, res) {
  const user = await UserSchema.findById(req.user._id);
  const error = req.flash('error').join('');
  
  return res.render('pages/profile', { user, error });
};

const usersPage = async function (req, res) {
  if(!req.user.admin) return res.render('pages/home');
  const query = {};
  if (req.query.username)
    query['username'] = new RegExp(req.query.username, 'i');
  const users = await UserSchema.paginate(query, { page: req.query.page || 1, limit: 10 });
  res.render('pages/users', { user: req.user, users, username: req.query.username });
}

module.exports = {
  profilePage,
  usersPage
};
