const UserSchema = require('../models/user');
const SaleSchema = require('../models/sale');
const CreditPlanSchema = require('../models/credit-plan');

const creditsPage = async function (req, res, next) {
  const [{ pagesBalance }, plans] = await Promise.all([
    UserSchema.findById(req.user._id),
    CreditPlanSchema.find({}).lean(),
  ]);
  // sales.sort((a, b) => a.unitPriceStartsOnPage - b.unitPriceStartsOnPage);
  res.render('pages/credits', { user: req.user, pagesBalance, plans });
};

module.exports = {
  creditsPage
};