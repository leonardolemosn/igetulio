const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CreditPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true
  }
);

CreditPlanSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('CreditPlan', CreditPlanSchema);