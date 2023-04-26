const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function createInvoice(invoice) {
  let doc = new PDFDocument({ size: "A5", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);
  const fileName = `invoice.pdf`;
  const filePath = path.join(__dirname, "..", "uploads", fileName);
  doc.pipe(fs.createWriteStream(filePath));
  doc.end();
}

function generateHeader(doc) {
  doc
    .image("../server/images/collegelogo.png", 50, 30, { width: 45 })
    .fillColor("#444444")
    .fontSize(20)
    .text("Birendra Memorial College", 105, 37)
    .fontSize(14)
    .text("Dharan, Sunsari", 65, 60, { align: "center" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("PAYMENT RECEIPT", 50, 110, { align: "center" });

  generateHr(doc, 150);

  const customerInformationTop = 165;

  doc
    .fontSize(9)
    .text("StudentId:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.student.studentId, 130, customerInformationTop)
    .font("Helvetica")
    .text("Payment Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 130, customerInformationTop + 15)
    .text("Total Due:", 50, customerInformationTop + 30)
    .text(invoice.student.total_due, 130, customerInformationTop + 30)

    .font("Helvetica-Bold")
    .text(invoice.student.name, 285, customerInformationTop)
    .font("Helvetica")
    .text(
      invoice.student.address + ", " + invoice.student.country,
      290,
      customerInformationTop + 15
    )
    .text(invoice.transactiontype, 290, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 217);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 230;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "TransactionId",
    "Description",
    "Amount"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.transactions.length; i++) {
    const transaction = invoice.transactions[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      transaction.transactionId,
      transaction.description,
      transaction.amount
    );
    generateHr(doc, position + 20);
  }

  const paidPosition = invoiceTableTop + (i + 1) * 30;
  for (i = 0; i < invoice.transactions.length; i++) {
    const transaction = invoice.transactions[i];
    generateTableRow(doc, paidPosition, "", "Total Paid", transaction.amount);

    const duePosition = paidPosition + 25;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      duePosition,
      "",
      "Total Due",
      invoice.student.total_due - transaction.amount
    );
    doc.font("Helvetica");
  }
}

function generateFooter(doc) {
  doc.fontSize(10).text("Payment with transactionId is successful!", 55, 400, {
    align: "center",
    width: 300,
  });
}

function generateTableRow(doc, y, TransactionId, Description, Amount) {
  doc
    .fontSize(10)
    .text(TransactionId, 50, y)
    .text(Description, 200, y)
    .text(Amount, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(380, y).stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoice,
};
