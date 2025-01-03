const ConsumptionSchema = require('../models/consumption');

const admConsumptionPage = async function (req, res, next) {
  if(!req.user.admin) return res.redirect('/home');
  
  const { username } = req.params;

  let query = { 'username': username };

  const consumptions = await ConsumptionSchema.paginate(query, { page: req.query.page || 1, limit: 10, sort: { createdAt: -1 } });
  res.render('pages/consumption', { user: req.user, consumptions, consumptionUser: username });
};

const consumptionPage = async function (req, res, next) {
  const { username } = req.user;

  let query = { 'username': username };

  const consumptions = await ConsumptionSchema.paginate(query, { page: req.query.page || 1, limit: 10, sort: { createdAt: -1 } });
  res.render('pages/consumption', { user: req.user, consumptions, consumptionUser: username });
};

module.exports = {
  admConsumptionPage,
  consumptionPage,
};