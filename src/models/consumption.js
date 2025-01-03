const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const ConsumptionSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    suit: {
      type: String,
      required: true
    },
    suitIdentifier: {
      type: String,
      required: true
    },
    pages: {
      type: String,
      required: true
    },
    pageCount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

ConsumptionSchema.pre('save', function (next) {
  const consumption = this;
  try {
    consumption.pageCount = consumption.pages.split(',').reduce((acc, p) => (p.indexOf('-') == -1 ? 1 : Math.abs(eval(p)) + 1) + acc, 0);
    next();
  } catch (error) {
    next(error);
  }
});

ConsumptionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Consumption", ConsumptionSchema);