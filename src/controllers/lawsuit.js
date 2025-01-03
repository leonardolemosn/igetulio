const axios = require('axios').default;
const { Storage } = require('@google-cloud/storage');
const logger = require('../util/logger');
const { getPagesCost, } = require('../util');

const storage = new Storage({
  credentials: {
    client_email: process.env.CLOUD_STORAGE_CLIENT_EMAIL,
    private_key: process.env.CLOUD_STORAGE_PRIVATE_KEY.replace(/\\n/ig, '\n'),
    projectId: process.env.CLOUD_STORAGE_PROJECT_ID,
  }
});
const bucket = storage.bucket('cosmo-documents');

const LawsuitSchema = require('../models/lawsuit');
const ConsumptionSchema = require('../models/consumption');
const UserSchema = require('../models/user');

const seed = async function (req, res, next) {
  const suit = {
    identifier: `000${Math.random() * 100000000000000000}`,
    people: [
      { name: 'Gustavo Bueno', status: 'Processando' },
      { name: 'Carlos Victor', status: 'Erro' },
      { name: 'Rodrigo Nunes', status: 'Concluído' }
    ]
  }

  const { _id } = jwt.decode(req.cookies.token);
  suit.owner = _id;

  await new LawsuitSchema(suit).save();

  res.sendStatus(200);
};

const deleteById = async function (req, res, next) {
  const response = await LawsuitSchema.deleteOne({ _id: req.params.id });
  res.redirect('/home');
};

const findAll = async function (req, res, next) {
  const suits = await LawsuitSchema.find({}).lean();
  res.json(suits);
};

const save = async function (req, res, next) {
  try {
    const { _id } = req.user;

    if (!_id) {
      throw new Error('Usuário não autenticado.');
    }

    const suit = {};
    suit.owner = _id;

    const lawsuit = new LawsuitSchema(suit);
    await lawsuit.save();

    return res.redirect(`/lawsuits/${lawsuit.id}`);
  } catch (error) {
    console.error('Erro ao salvar o processo:', error);
    req.flash('error', 'Ocorreu um erro ao salvar o processo.');
    return res.redirect('suit-register'); // Redireciona para a página "home" ao invés de renderizar diretamente
  }
};



const update = async function (req, res, next) {
  const lawsuit = await LawsuitSchema.findById(req.params.id);
  const suit = req.body.suit || {};
  suit.people = suit.people || [];

  if (!lawsuit)
    return res.redirect('/lawsuits');

  if (suit.identifier && suit.person && suit.person.name && suit.person.fiscalCode) {
    lawsuit.people.push({ name: suit.person.name, fiscalCode: suit.person.fiscalCode });
  } else {
    return res.render('pages/suit-register', { user: req.user, suit, });
  }

  lawsuit.identifier = suit.identifier;

  await lawsuit.save();

  return res.redirect(`/lawsuits/${lawsuit.id}`);
};

const upload = async function (req, res, next) {
  const { pagesBalance } = await UserSchema.findById(req.user._id).exec();
  const pagesCost = getPagesCost(req.body.pages);
  if (pagesBalance < pagesCost) {
    req.flash('error', 'Saldo insuficiente!');
    return res.redirect('back');
  }
  let updateQuery = {
    "people.$.status": 'Não iniciado',
    "people.$.originalFile": '',
    "people.$.csvFile": '',
    "people.$.pages": req.body.pages,
    "people.$.documentData": null
  };
  if (!req.file) {
    updateQuery["people.$.status"] = 'Erro';
    await LawsuitSchema.updateOne(
      { "people._id": req.params.id },
      { $set: updateQuery }).exec();
    return res.redirect(`/lawsuits/${req.body.suit._id}`);
  }

  const options = {
    destination: `folhas-de-ponto/${req.file.filename}.pdf`,
    resumable: true,
    validation: 'crc32c'
  };

  await LawsuitSchema.updateOne(
    { "people._id": req.params.id },
    { $set: updateQuery }).exec();
  res.redirect(`/lawsuits/${req.body.suit._id}`);

  bucket.upload(req.file.path, options, async function (err, file) {
    await new ConsumptionSchema({
      username: req.user.username,
      userId: req.user._id,
      company: req.user.company,
      suit: req.body.suit._id,
      suitIdentifier: req.body.suit.identifier,
      pages: req.body.pages,
      date: new Date(),
      pageCount: 0
    }).save();
    logger.error(err);
    const url = await file.getSignedUrl({
      action: 'read',
      expires: '03-17-2025'
    }) || [''];
    updateQuery["people.$.originalFile"] = url[0];
    await LawsuitSchema.updateOne({ "people._id": req.params.id }, { $set: updateQuery }).exec();
    axios.get(`${process.env.OCR_BASE_URL}/ocr/${req.body.person._id}/user/${req.user._id}?originalFileName=${options.destination}&pages=${req.body.pages}`)
      .then(function (response) {
        // handle success
        logger.debug(response)
        // res.redirect(`/lawsuits/${req.body.suit._id}`);
      }).catch(function (error) {
        logger.debug(error);
      });
  });
};


module.exports = {
  seed,
  deleteById,
  findAll,
  save,
  update,
  upload,
};