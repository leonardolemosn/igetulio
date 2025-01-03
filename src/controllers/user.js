const UserSchema = require('../models/user');
const mail = require('../helpers/mail');
const logger = require('../util/logger');

const changeActiveStatus = async function (req, res, next) {
  if(!req.user.admin) return res.redirect('/home');
  await UserSchema.updateOne({ _id: req.params.id }, { $set: { active: req.params.status }})
  return res.redirect('/users');
};

const changeAdminStatus = async function (req, res, next) {
  if(!req.user.admin) return res.redirect('/home');
  await UserSchema.updateOne({ _id: req.params.id }, { $set: { admin: true }})
  return res.redirect('/users');
};

const changePassword = async function (req, res, next) {
  if (!req.body.password) {
    req.flash('error', 'O campo senha deve ser preenchido.');
    return res.redirect('/profile');
  }

  const user = await UserSchema.findById(req.user._id);
  user.password = req.body.password;
  await user.save();

  req.flash('error', 'Senha alterada com sucesso!');

  return res.redirect('/profile');
};

const recoverPassword = async function (req, res, next) {
  try {
    if (!req.body.email) {
      req.flash('error', 'O campo senha e-mail deve ser preenchido.');
      return res.redirect('/forgot-password');
    }
  
    const user = await UserSchema.findOne({ email: req.body.email });
    if (user) {
      const password = Math.random().toString(36).slice(2);
      user.password = password;
      await user.save();
      await mail.sendMail(req.body.email, 'Recuperação de usuário', `Olá, \n sua nova senha para acessar o sistema iGetulio é ${password}`)
    }
    
    req.flash('error', 'As instruções de definição de senha foram enviadas para o seu e-mail!');
  
    return res.redirect('/forgot-password'); 
  } catch (error) {
    req.flash('error', 'Ops, alguma coisa deu errado, por favor tente novamente mais tarde!');
    return res.redirect('/forgot-password');
  }
};

const donateCredits = async function (req, res, next) {
  const { id } = req.params;
  await UserSchema.updateOne({ _id: id }, { $inc: { pagesBalance: req.body.credits } });
  return res.redirect('back');
};

const deleteUser = async function (req, res, next) {
  const { id } = req.params;
  await UserSchema.deleteOne({ _id: id });
  return res.redirect('/users');
};

module.exports = {
  changeActiveStatus,
  changeAdminStatus,
  changePassword,
  recoverPassword,
  donateCredits,
  deleteUser
};
