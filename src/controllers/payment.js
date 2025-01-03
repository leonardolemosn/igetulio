const axios = require('axios');
const parser = require('xml2json');
const TransactionSchema = require('../models/transaction');
const UserSchema = require('../models/user');
const CreditPlanSchema = require('../models/credit-plan');
const querystring = require('querystring');
const { getTotalPrice, } = require('../util');
const { PAGSEGURO_EMAIL, PAGSEGURO_TOKEN } = process.env;

const pagseguroApi = axios.create({
  baseURL: 'https://ws.pagseguro.uol.com.br/v2',
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1"
  }
});

const redirect = async function (req, res, next) {
  try {
    const plan = await CreditPlanSchema.findById(req.body.plan).lean();
    const totalPrice = plan.price * (req.body.units || 1);
    const paymentInfo = {
      userId: req.user._id,
      itemId: "0001",
      reference: Date.now().toString(),
      itemDescription: `Compra do ${plan.name} - ${(req.body.units || 1) * plan.quantity} paginas.`,
      value: totalPrice.toFixed(2).toString(),
      boughtPagesAmount: parseInt((req.body.units || 1) * plan.quantity, 10),
      date: new Date(),
      status: '1',
    }

    const params = {
      email: PAGSEGURO_EMAIL,
      token: PAGSEGURO_TOKEN,
      currency: "BRL",
      itemId1: paymentInfo.itemId,
      senderEmail: req.user.email,
      // senderEmail: 'xxxxxxxxxx@sandbox.pagseguro.com.br', //deixar apenas no ambiente de sanbox, se nao o pagseguro vai bugar
      reference: paymentInfo.reference,
      itemDescription1: paymentInfo.itemDescription,
      itemAmount1: plan.price.toFixed(2).toString(),
      itemQuantity1: req.body.units || '1',
      weight: '1',
      notificationURL: process.env.PAGSEGURO_NOTIFICATION_URL
    }
    const xmlAsResponse = await pagseguroApi.post(`/checkout`, querystring.stringify(params));
    const { checkout: { code } } = JSON.parse(parser.toJson(xmlAsResponse.data));
    const transaction = new TransactionSchema(paymentInfo);
    await transaction.save();
    res.redirect(`https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${code}`);
  } catch (e) {
    console.log(e);
  }
};

const notification = async function(req, res, next) {
  try {
    const queryParams = `email=${PAGSEGURO_EMAIL}&token=${PAGSEGURO_TOKEN}`;
    const xmlAsResponse = await pagseguroApi.get(`/transactions/notifications/${req.body.notificationCode}?${queryParams}`);
    const json = JSON.parse(parser.toJson(xmlAsResponse.data));
    if (json.transaction.status === '3') { //status de pagamento confirmado
      const transaction = await TransactionSchema.findOneAndUpdate(
        { reference: json.transaction.reference },
        { status: '3' },
      );
      await UserSchema.updateOne({ _id: transaction.userId }, { $inc: { pagesBalance: transaction.boughtPagesAmount } });
    }
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  redirect,
  notification,
};