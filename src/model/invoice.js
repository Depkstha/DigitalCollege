const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    student: {
      studentId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "Nepal",
      },
      total_due: {
        type: Number,
        required: true,
      },
    },
    transactions: [
      {
        transactionId: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    transactiontype: {
      type: String,
      required: true,
      default: "Online payment",
    },
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
