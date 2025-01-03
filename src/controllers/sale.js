const SaleSchema = require('../models/sale');

const save = async function (req, res, next) {
  try {
    const { body } = req;
    const sale = new SaleSchema(body);
    await sale.save();
    return res.redirect('/sales');
  } catch (e) {
    const errorMessage = e.code === 11000 ? 'Já existe um valor para esta quantidade de páginas' : 'Ocorreu um erro ao gravar';
    req.flash('error', errorMessage);
    return res.redirect('back');
  }
};

const findAll = async function (req, res, next) {
  const sales = await SaleSchema.find({}).lean();
  res.json(sales);
};

const deleteOne = async function (req, res, next) {
  const { id } = req.params;
  await SaleSchema.deleteOne({ _id: id });
  return res.redirect('/sales');
};

const update = async function (req, res, next) {
  try {
    const { id } = req.params;
    const { body } = req;
    await SaleSchema.updateOne({ _id: id }, body);
    return res.redirect('/sales');
  } catch (e) {
    const errorMessage = e.code === 11000 ? 'Já existe um valor para esta quantidade de páginas' : 'Ocorreu um erro ao gravar';
    req.flash('error', errorMessage) ;
    return res.redirect('back');
  }
};

const findById = async function (req, res, next) {
  const { id } = req.params;
  const sale = await SaleSchema.findById(id).lean();
  res.json(sale);
};

module.exports = {
  save,
  findAll,
  deleteOne,
  update,
  findById,
};