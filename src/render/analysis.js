const Mail = require('nodemailer/lib/mailer');
const UserSchema = require('../models/user');

const analysisPage = async function (req, res, next) {
  const user = await UserSchema.findById(req.user._id);

  if(user.active)
    return res.redirect('/home');

  return res.render('pages/analysis', { user: req.user });
};

module.exports = {
    analysisPage,
};

 