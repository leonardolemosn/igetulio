const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    itemId: {
      type: String,
      required: true,
    },
    itemDescription: {
      type: String,
    },
    boughtPagesAmount: {
      type: Number,
      require: true
    }
  },
  {
    timestamps: true,
  },
);

TransactionSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Transaction', TransactionSchema);