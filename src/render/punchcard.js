const mongoose = require('mongoose');
const DocumentDataSchema = require('../models/document-data');
const LawsuitSchema = require('../models/lawsuit');
const CSV_HEADER = ['Data', 'Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2', 'Entrada 3', 'Saída 3', 'Entrada 4', 'Saída 4', 'Entrada 5', 'Saída 5', 'Entrada 6', 'Saída 6'];

const punchcardPage = async function (req, res, next) {
  
  const punchcard = await DocumentDataSchema.findById(req.params.id).lean();
  const suit = await LawsuitSchema.findOne({ 'people._id': punchcard.peopleId }, {_id: 1});
  const isOddCount = punchcard.documentContent.reduce((acc, cur) => acc + cur.isOdd, 0);
  const isGapCount = punchcard.documentContent.reduce((acc, cur) => acc + cur.isGap, 0);
  return res.render('pages/punchcard', {
    user: req.user,
    header: CSV_HEADER,
    punchcard: punchcard.documentContent,
    punchcardId: req.params.id,
    suitId: suit._id,
    peopleId: req.params.id,
    isOddCount,
    isGapCount
  });
};

const punchcardEditPage = async function (req, res, next) {
  const punchcardsIds = Object.entries(req.body.punchcards)
    .map((e) => ({ id: e[0], value: e[1] }))
    .filter(e => eval(e.value))
    .map(e => mongoose.Types.ObjectId(e.id));

  const documents = await DocumentDataSchema.aggregate([
    { $match: { '_id': mongoose.Types.ObjectId(req.params.id) } },
    { $unwind: '$documentContent' },
    { $match: { 'documentContent._id': { $in: punchcardsIds } } },
  ]);

  const punchcard = documents.map(doc => doc.documentContent);

  const isOddCount = punchcard.reduce((acc, cur) => acc + cur.isOdd, 0);
  const isGapCount = punchcard.reduce((acc, cur) => acc + cur.isGap, 0);

  return res.render('pages/punchcard-edit', {
    user: req.user, header: CSV_HEADER,
    punchcard,
    punchcardId: req.params.id,
    suitId: req.body.suitId,
    peopleId: req.body.peopleId,
    isOddCount,
    isGapCount
  });
};

module.exports = {
  punchcardPage,
  punchcardEditPage
};