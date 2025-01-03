const mongoose = require('mongoose');
const stream = require('stream');
const DocumentDataSchema = require('../models/document-data');
const moment = require('moment');
const logger = require('../util/logger');


const timeEdit = async function (req, res, next) {
  logger.debug(req);

  const docs = Object.entries(req.body.doc).map((e) => ({ id: e[0], times: e[1].filter(t => t) }));

  const promises = docs.map(doc => {
    let updateQuery = {};
    updateQuery["documentContent.$.times"] = doc.times;
    updateQuery["documentContent.$.isOdd"] = doc.times.length % 2 !== 0;

    if (doc.times.length) {
      updateQuery["documentContent.$.isGap"] = false;
    }

    return DocumentDataSchema.updateOne(
      { "_id": mongoose.Types.ObjectId(req.params.id), "documentContent._id": mongoose.Types.ObjectId(doc.id) },
      { $set: updateQuery })
  });

  const result = await Promise.all(promises)

  logger.debug(result);

  return res.redirect(`/punchcards/${req.params.id}`);
};

const download = async function (req, res, next) {
  const peopleId = req.params.peopleId;
  const docDataId = req.params.docDataId;
  const doc = await DocumentDataSchema.findOne({ peopleId, '_id': docDataId }).lean();
  const { documentContent } = doc;
  let csv = 'Data,Entrada 1,Saída 1,Entrada 2,Saída 2,Entrada 3,Saída 3,Entrada 4,Saída 4,Entrada 5,Saída 5,Entrada 6,Saída 6\n';
  documentContent.forEach(content => {
    const { date, times } = content;
    csv = csv.concat(`${date},`);
    times.forEach(time => {
      csv = csv.concat(`${time},`)
    });
    csv = csv.substring(0, csv.length - 1);
    csv = csv.concat('\n');
  });
  const buffer = Buffer.from(csv, 'utf-8');
  const readStream = new stream.PassThrough();
  readStream.end(buffer);
  res.set('Content-disposition', `attachment; filename=pje-calc-${doc.peopleId}.csv`);
  res.set('Content-Type', 'text/csv');
  readStream.pipe(res);
}

const applyRules = async function (req, res, next) {
  const doc = await DocumentDataSchema.findOne({ '_id': req.params.id });
  if (req.body.addStartTime === 'on') {
    const minutes = Math.abs(req.body.addMinutesToStart) * -1 || 0;
    
    doc.documentContent = doc.documentContent.map(content => {
      if (content.times.length) {
        const momentTime = moment(content.times[0], 'HH:mm');
        content.times.set(0, momentTime.add(minutes, 'minutes').format('HH:mm'));
      }

      return content;
    });

  }

  if (req.body.addEndTime === 'on') {
    const minutes = Math.abs(req.body.addMinutesToEnd) || 0;
    
    doc.documentContent = doc.documentContent.map(content => {
      if (content.times.length) {
        const index = content.times.length - 1;
        const momentTime = moment(content.times[index], 'HH:mm');
        content.times.set(index, momentTime.add(minutes, 'minutes').format('HH:mm'));
      }

      return content;
    });

  }

  if (req.body.onlyStartAndEnd === 'on') {
    doc.documentContent = doc.documentContent.map(content => {
      if (content.times.length >= 2) {
        content.times = [content.times.shift(), content.times.pop()];
        content.isOdd = false;
      }
      return content;
    });

  }

  if (req.body.addIntervalTime === 'on') {
    let { intervalTime } = req.body;
    doc.documentContent = doc.documentContent.map(content => {
      if (content.times.length == 2) {
        const date1 = moment(content.times[0], 'HH:mm');
        const date2 = moment(content.times[1], 'HH:mm');
        const diff = date2.diff(date1, 'hours');
        
        if(diff >= 6 || diff < 0) {
          const startIntervalTime = date1.add(3, 'hours').format('HH:mm');
          const endIntervalTime = date1.add(intervalTime, 'minutes').format('HH:mm');
          content.times.splice(1, 0, startIntervalTime, endIntervalTime);
        }
      }
      return content;
    });

  }

  await doc.save();

  return res.redirect(`/punchcards/${req.params.id}`);

}

module.exports = {
  timeEdit,
  download,
  applyRules
};