const axios = require('axios').default;
const { Storage } = require('@google-cloud/storage');
const mongoose = require('mongoose');
const CSV_HEADER = ['Data', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2', 'Entrada 3', 'Saída 3', 'Entrada 4', 'Saída 4', 'Entrada 5', 'Saída 5', 'Entrada 6', 'Saída 6'];
const logger = require('../util/logger');

const storage = new Storage({
  credentials: {
    client_email: process.env.CLOUD_STORAGE_CLIENT_EMAIL,
    private_key: process.env.CLOUD_STORAGE_PRIVATE_KEY.replace(/\n/ig, '\n'),
    projectId: process.env.CLOUD_STORAGE_PROJECT_ID,
  }
});
const bucket = storage.bucket('cosmo-documents');

const LawsuitSchema = require('../models/lawsuit');

const registerSuitPage = async function (req, res, next) {
  const error = req.flash('error').join('');
  return res.render('pages/suit-register', { user: req.user, suit: { people: [] }, error });
};

const punchcardPage = async function (req, res, next) {
  let suit = await LawsuitSchema.aggregate([
    { $match: { 'people._id': mongoose.Types.ObjectId(req.params.id) } },
    { $unwind: '$people' },
    { $match: { 'people._id': mongoose.Types.ObjectId(req.params.id) } },
  ]);

  let json = eval(suit[0].people.json);

  return res.render('pages/punchcard', { user: req.user, header: CSV_HEADER, punchcard: json, suitId: suit._id, peopleId: req.params.id });
};

const editSuitPage = async function (req, res, next) {
  const error = req.flash('error').join('');
  const suit = await LawsuitSchema.findById(req.params.id);
  suit.people = suit.people || [];
  return res.render('pages/suit-register', { user: req.user, suit, error });
};

const editFile = async function (req, res, next) {
  try {
    if (!req.file) {
      req.flash('error', 'É necessário fornecer um arquivo para upload.');
      return res.redirect('/home');
    }

    const options = {
      destination: `folhas-de-ponto/${req.file.filename}.pdf`,
      resumable: true,
      validation: 'crc32c'
    };

    bucket.upload(req.file.path, options, async function (err, file) {
      if (err) {
        logger.error('Erro ao fazer o upload do arquivo:', err);
        req.flash('error', 'Erro ao fazer o upload do arquivo.');
        return res.redirect('/home');
      }

      const url = await file.getSignedUrl({
        action: 'read',
        expires: '03-17-2025'
      }) || [''];

      // Criar um novo processo associado ao usuário logado
      const newPersonId = new mongoose.Types.ObjectId(); // Gerar um novo ObjectId para a pessoa
      const newSuit = new LawsuitSchema({
        identifier: `CALC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Identificador único para o processo
        owner: req.user._id, // Associar o processo ao ID do usuário logado
        people: [
          {
            _id: newPersonId, // Atribuir o novo ID ao person
            name: 'Reclamante', // Nome padrão, já que não haverá cadastro prévio
            status: 'Não iniciado', // Status inicial do documento
            originalFile: url[0], // URL do arquivo após o upload ao bucket
            pages: req.body.pages || '' // Páginas fornecidas pelo usuário (se houver)
          }
        ]
      });

      // Salvar o novo processo no banco de dados
      await newSuit.save();

      // Chamar o OCR endpoint para processar o arquivo
      axios.get(`${process.env.OCR_BASE_URL}/ocr/${req.file.filename}`)
        .then(function (response) {
          logger.debug('OCR processado com sucesso:', response);
          res.redirect(`/lawsuits/${newSuit._id}`);
        })
        .catch(function (error) {
          logger.error('Erro ao processar OCR:', error);
          req.flash('error', 'Erro ao processar o OCR.');
          return res.redirect('/home');
        });
    });
  } catch (error) {
    logger.error('Erro no processamento do arquivo:', error);
    req.flash('error', 'Erro no processamento do arquivo.');
    return res.redirect('/home');
  }
};

module.exports = {
  registerSuitPage,
  editSuitPage,
  editFile,
  punchcardPage, // Não está sendo utilizado, remover se não for necessário
};
