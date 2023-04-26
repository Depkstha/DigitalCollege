const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },

  total_Fees: {
    type: Number,
    required: true,
    default: 0,
  },
  total_Paid: {
    type: Number,
    required: true,
    default: 0,
  },

  total_Due: {
    type: Number,
    required: true,
    default: 0,
  },

  payloads: [
    {
      type: Object,
    },
  ],

  transactionRecords: [
    {
      type: Object,
    },
  ],
  file: {
    data: Buffer,
    contentType: String,
  },
});

const FeeStat = mongoose.model("FeeStat", feeStructureSchema);
module.exports = FeeStat;
