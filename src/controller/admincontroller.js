const Admin = require("../model/admin");
const Notice = require("../model/notice");
const Invoice = require("../model/invoice");
require("../db/database");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(403).send({ message: "Email or password missing" });
    }
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      return res.status(403).send({ message: "Invalid Credentials" });
    }
    console.log(admin._id);
    // const isMatch = await bcrypt.compare(password, admin.password);
    // if (isMatch === false) {
    //   return res.status(403).send({ message: "Invalid credentials" });
    // }
    if (password === admin.password) {
      const token = jwt.sign({ _id: admin._id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      console.log(token);
      return res.status(200).json(token);
    } else {
      return res.status(403).send({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.createpdf = async (req, res) => {
  const { transactionId } = req.body;
  const invoice = await Invoice.findOne({ transactionId });
  createpdf(invoice, "invoice.pdf");
  return res.download("invoice.pdf");
};

exports.uploadNotice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const newNotice = new Notice();
    newNotice.title = req.body.title;
    newNotice.description = req.body.description;
    newNotice.photo = req.file.filename;
    newNotice.noticetype = req.body.noticetype;
    newNotice.semester = req.body.semester;
    await newNotice.save();
    console.log("notice uploaded successfully");

    res.send({ message: "notice uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findOne();

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (!notice.photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.sendFile(notice.photo, { root: "./src/uploads" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
