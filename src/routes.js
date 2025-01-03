const multer = require('multer');
var upload = multer({ dest: '/tmp/' });

const cookie = require('./middlewares/cookie');
const isAdmin = require('./middlewares/isAdmin');

const {
  authController,
  lawSuitController,
  punchCardController,
  userController,
  paymentController,
  saleController,
  creditPlanController
} = require('./controllers');

const {
  analysisRender,
  authRender,
  consumptionRender,
  homeRender,
  lawSuitRender,
  punchCardRender,
  userRender,
  creditRender,
  saleRender,
  creditPlanRender
} = require('./render');

module.exports = function routes(app) {

  // pages
  app.get('/', function (req, res) { res.redirect('/home'); });
  app.get('/login', cookie.checkExists, authRender.loginPage);
  app.get('/register', cookie.checkExists, authRender.registerPage);
  app.get('/forgot-password', cookie.checkExists, authRender.forgotPasswordPage);
  app.get('/home', homeRender.homePage);
  app.get('/lawsuits', lawSuitRender.registerSuitPage);
  app.get('/lawsuits/:id', lawSuitRender.editSuitPage);
  app.post('/suit', lawSuitRender.registerSuitPage);
  app.get('/punchcards/:id', punchCardRender.punchcardPage);
  app.post('/punchcards/:id', punchCardRender.punchcardEditPage);
  app.get('/profile', userRender.profilePage);
  app.get('/users', userRender.usersPage);
  app.get('/consumption', consumptionRender.consumptionPage);
  app.get('/consumption/:username', consumptionRender.admConsumptionPage);
  app.get('/analysis', analysisRender.analysisPage);
  app.get('/credits', creditRender.creditsPage);
  app.get('/sales', isAdmin, saleRender.listSalesPage);
  app.get('/sale/register', isAdmin, saleRender.registerSalePage);
  app.get('/sale/edit/:id', isAdmin, saleRender.editSalePage);
  app.post('/lawsuits/file', upload.single('file'), lawSuitRender.editFile);
  app.get('/credit-plans', creditPlanRender.creditPlansPage);
  app.get('/credit-plans/register', creditPlanRender.insertCreditPlansPage);
  app.get('/credit-plans/edit/:id', creditPlanRender.editCreditPlansPage);
  


  // services
  app.post('/signup', authController.signUp);
  app.post('/signin', authController.signIn);

  app.get('/logout', authController.logOut);

  app.get('/api/lawsuits', lawSuitController.findAll);

  app.post('/payment/redirect', paymentController.redirect);
  app.post('/payment/notification', paymentController.notification);

  app.post('/lawsuits/save', lawSuitController.save);
  app.post('/lawsuits/save/:id', lawSuitController.update);
  app.get('/lawsuits/seed', lawSuitController.seed);
  app.get('/lawsuits/delete/:id', lawSuitController.deleteById);
  app.post('/lawsuits/file/:id', upload.single('file'), lawSuitController.upload);

  app.post('/sales', isAdmin, saleController.save);
  app.post('/sales/:id', isAdmin, saleController.update);
  app.get('/sales/list', isAdmin, saleController.findAll);
  app.get('/sales/:id', isAdmin, saleController.findById);
  app.get('/sales/delete/:id', isAdmin, saleController.deleteOne);

  app.post('/punchcards-time/:id', punchCardController.timeEdit);
  app.get('/punchcards-download/:peopleId/:docDataId', punchCardController.download);
  app.post('/punchcards-rules/:id', punchCardController.applyRules);

  app.post('/change-password', userController.changePassword);

  app.post('/recover-password', userController.recoverPassword);

  app.post('/donate/:id', isAdmin, userController.donateCredits);

  app.get('/users/:id/change-active-status/:status', userController.changeActiveStatus);
  app.get('/users/:id/change-admin-status/:status', userController.changeAdminStatus);
  app.get('/users/:id/delete', userController.deleteUser);

  app.post('/credit-plans', creditPlanController.save);
  app.post('/credit-plans/:id', creditPlanController.update);
  app.get('/credit-plans/delete/:id', creditPlanController.deleteOne);

  app.get('/online', (req, res) => res.json({ status: "ONLINE" }));

}
