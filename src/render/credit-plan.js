const CreditPlanSchema = require('../models/credit-plan');

const creditPlansPage = async function (req, res, next) {
  const creditPlans = await CreditPlanSchema.paginate({}, { page: req.query.page || 1, limit: 10 });
  res.render('pages/credit-plans', { plans: creditPlans, user: req.user });
};

const editCreditPlansPage = async function (req, res, next) {
  const { id } = req.params;
  const creditPlan = await CreditPlanSchema.findOne({ _id: id, });
  const error = req.flash('error').join('');
  res.render('pages/credit-plans-form', { user: req.user, plan: creditPlan, error, isUpdate: true });
};

const insertCreditPlansPage = async function (req, res, next) {
  const error = req.flash('error').join('');
  res.render('pages/credit-plans-form', { user: req.user, plan: {}, error, isUpdate: false });
};

module.exports = {
  creditPlansPage,
  editCreditPlansPage,
  insertCreditPlansPage
};