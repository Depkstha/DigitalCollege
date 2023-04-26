const axios = require("axios");
const FeeStat = require("../model/feestat");
const Student = require("../model/student");
const Invoice = require("../model/invoice");
const fs = require("fs");
const path = require("path");
const { createInvoice } = require("../utils/createInvoice");

// exports.updateFeesManually = async (req, res) => {
//   try {
//     const { studentId, Fees, Paid } = req.body;
//     const doc = await FeeStat.findOne({ studentId: studentId });
//     if (!doc) {
//       return res
//         .status(404)
//         .json({ message: "Fee structure for this student not found" });
//     }
//     if (Paid !== 0 || null) {
//       const student = await Student.findOne({
//         studentId: studentId,
//       });
//       console.log(student);
//       const invoice = {
//         student: {
//           studentId: studentId,
//           name: student.fname + " " + student.lname,
//           address: student.address,
//           country: "Nepal",
//           total_due: doc.total_Due,
//         },
//         transactions: [
//           {
//             transactionId: 1,
//             description: "Semester fee",
//             amount: Paid,
//           },
//         ],
//         transactiontype: "Offline payment",
//       };
//       console.log(invoice);
//       createInvoice(invoice, "invoice.pdf");
//     }
//     doc.total_Fees += Fees;
//     doc.total_Paid += Paid;
//     doc.total_Due = doc.total_Fees - doc.total_Paid;
//     await doc.save();
//     return res
//       .status(200)
//       .json({ message: "Fee structure updated successfully" });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
exports.updateFeesManually = async (req, res) => {
  try {
    const { studentId, Fees, Paid } = req.body;
    const doc = await FeeStat.findOne({ studentId: studentId });
    if (!doc) {
      return res
        .status(404)
        .json({ message: "Fee structure for this student not found" });
    }
    if (Paid !== 0 || Paid !== null) {
      const student = await Student.findOne({
        studentId: studentId,
      });
      console.log(student);
      const invoice = {
        student: {
          studentId: studentId,
          name: student.fname + " " + student.lname,
          address: student.address,
          country: "Nepal",
          total_due: doc.total_Due,
        },
        transactions: [
          {
            transactionId: 1,
            description: "Semester fee",
            amount: Paid,
          },
        ],
        transactiontype: "Offline payment",
      };
      console.log(invoice);
      const newInvoice = new Invoice(invoice);
      newInvoice.save((err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Invoice saved successfully");
          console.log(result);
        }
      });
      createInvoice(invoice, "invoice.pdf");
    }
    doc.total_Fees += Fees;
    doc.total_Paid += Paid;
    doc.total_Due = doc.total_Fees - doc.total_Paid;
    await doc.save();
    return res
      .status(200)
      .json({ message: "Fee structure updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifypayment = async (req, res) => {
  const payload = req.body;
  console.log(payload);
  let data = {
    token: payload.token,
    amount: payload.amount,
  };
  const doc = await FeeStat.findOne({ studentId: payload.product_identity });
  console.log(doc);
  const student = await Student.findOne({
    studentId: payload.product_identity,
  });
  console.log(student);
  if (doc === null) {
    total_Due = 0;
  } else {
    total_Due = doc.total_Due;
  }
  try {
    let config = {
      headers: {
        Authorization: "Key test_secret_key_f74b27bc22a44749b26234ade9ae5223",
      },
    };
    const response = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      data,
      config
    );
    console.log(response.data);
    if (!doc) {
      const feestat = new FeeStat({
        id: student._id,
        studentId: payload.product_identity,
        payloads: payload,
        transactionRecords: response.data,
      });
      feestat.total_Paid += payload.amount / 100;
      feestat.total_Due = feestat.total_Fees - feestat.total_Paid;
      await feestat.save();
      // res.status(200).json({ message: "Payment done with idx successfully!" });
    } else {
      doc.payloads.push(payload);
      doc.transactionRecords.push(response.data);
      doc.total_Paid += payload.amount / 100;
      doc.total_Due = doc.total_Fees - doc.total_Paid;
      await doc.save();
      console.log(doc.payloads);
      res
        .status(200)
        // .json({ message: "Payment done with idx successfully and Updated!" });
    }
  } catch (error) {
    console.log(error);
  }
  const invoice = {
    student: {
      studentId: payload.product_identity,
      name: student.fname + " " + student.lname,
      address: student.address,
      country: "Nepal",
      total_due: total_Due,
    },
    transactions: [
      {
        transactionId: payload.idx,
        description: payload.product_name,
        amount: payload.amount / 100,
      },
    ],
    transactiontype: "Online payment",
  };
  console.log(invoice);
  const newInvoice = new Invoice(invoice);
  newInvoice.save((err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Invoice saved successfully");
      console.log(result);
    }
  });
  createInvoice(invoice, "invoice.pdf");
  console.log("pdf created successfully");
  const file = path.join(__dirname, "../uploads", "invoice.pdf");
  const filename = "invoice.pdf";
  res.download(file, filename);
};

// exports.feeStructure = async () => {
//   const token = req.coookies.jwttoken
//   const student = await Student.findOne({
//     _id: rootStudent._id,
//     "tokens.token": token,
//   })
//   try {
//     if (isEnrolled === true) {
//       const feeStat = new FeeStat({
//         _id: rootStudent.StudentId,
//         total_Fees: 100000,
//       })
//     }
// } catch (error) {
//     return res.status(500).json({ error: "Internal server error" })
//   }
// }
