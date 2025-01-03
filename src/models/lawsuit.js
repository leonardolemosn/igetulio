const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const LawsuitSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true
    },
    people: [
      {
        name: String,
        fiscalCode: String,
        status: String,
        originalFile: String,
        csvFile: String,
        splittedDoc: String,
        csvRuleFile: String,
        pages: String,
        documentData: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentData' }
      }
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
  },
  {
    timestamps: true
  }
);

LawsuitSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Lawsuit', LawsuitSchema);