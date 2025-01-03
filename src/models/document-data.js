const mongoose = require('mongoose');

const DocumentDataSchema = new mongoose.Schema(
    {
        peopleId: mongoose.Schema.Types.ObjectId,
        documentContent: [
            {
                date: String,
                times: [String],
                isOdd: Boolean,
                isGap: Boolean
            }
        ]
    }
);

module.exports = mongoose.model("DocumentData", DocumentDataSchema);