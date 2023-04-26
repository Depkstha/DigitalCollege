const express = require("express");
const upload = require("../utils/multer");
const {
  login,
  createpdf,
  uploadNotice,
  getNotice,
} = require("../controller/admincontroller");

const adminRoute = express.Router();

adminRoute.post("/login", login);
adminRoute.post("/uploadnotice", upload.single("image"), uploadNotice);
adminRoute.get("/getnotice",getNotice);

adminRoute.post("/createpdf", createpdf);

module.exports = adminRoute;
