const authController = require('./auth');
const creditPlanController = require('./credit-plan');
const lawSuitController = require('./lawsuit');
const punchCardController = require('./punchcard');
const userController = require('./user');
const paymentController = require('./payment');
const saleController = require('./sale');

module.exports = {
  authController,
  creditPlanController,
  lawSuitController,
  punchCardController,
  userController,
  paymentController,
  saleController,
};