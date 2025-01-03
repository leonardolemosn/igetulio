const CreditPlanSchema = require('../models/credit-plan');

const save = async function (req, res, next) {
  try {
    const { body } = req;
    const plan = new CreditPlanSchema(body);
    await plan.save();
    return res.redirect('/credit-plans');
  } catch (e) {
    const errorMessage = e.code === 11000 ? 'Já existe um valor para esta quantidade de páginas' : 'Ocorreu um erro ao gravar';
    req.flash('error', errorMessage);
    return res.redirect('back');
  }
};

const findAll = async function (req, res, next) {
  const plans = await CreditPlanSchema.find({}).lean();
  res.json(plans);
};

const deleteOne = async function (req, res, next) {
  const { id } = req.params;
  await CreditPlanSchema.deleteOne({ _id: id });
  return res.redirect('/credit-plans');
};

const update = async function (req, res, next) {
  try {
    const { id } = req.params;
    const { body } = req;
    await CreditPlanSchema.updateOne({ _id: id }, body);
    return res.redirect('/credit-plans');
  } catch (e) {
    const errorMessage = e.code === 11000 ? 'Já existe um valor para esta quantidade de páginas' : 'Ocorreu um erro ao gravar';
    req.flash('error', errorMessage);
    return res.redirect('back');
  }
};

const findById = async function (req, res, next) {
  const { id } = req.params;
  const plan = await CreditPlanSchema.findById(id).lean();
  res.json(plan);
};

module.exports = {
  save,
  findAll,
  deleteOne,
  update,
  findById,
};