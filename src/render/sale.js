const SaleSchema = require('../models/sale');

const listSalesPage = async function (req, res, next) {
  const sales = await SaleSchema.paginate({}, { page: req.query.page || 1, limit: 10 });
  sales.docs.sort((a, b) => a.unitPriceStartsOnPage - b.unitPriceStartsOnPage);
  res.render('pages/sales', { sales, user: req.user });
};

const registerSalePage = async function (req, res, next) {
  const error = req.flash('error').join('');
  res.render('pages/sale-edit', { user: req.user, sale: {}, error, isUpdate: false });
};

const editSalePage = async function (req, res, next) {
  const { id } = req.params;
  const sale = await SaleSchema.findOne({ _id: id, });
  const error = req.flash('error').join('');
  res.render('pages/sale-edit', { user: req.user, sale, error, isUpdate: true });
};


module.exports = {
  listSalesPage,
  registerSalePage,
  editSalePage,
};