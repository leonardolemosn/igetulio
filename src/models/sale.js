const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SaleSchema = new mongoose.Schema(
  {
    unitPrice: {
      type: Number,
      required: true
    },
    unitPriceStartsOnPage: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true
  }
);

SaleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Sale', SaleSchema);