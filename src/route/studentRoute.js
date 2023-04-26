const express = require("express");
const {
  attendance,
  register,
  login,
  verify,
  change_password,
  getallStudent,
  authentication,
  getAttendance,
  change_email,
  getAttendanceValue,
  uploadPhoto,
  getPhoto,
} = require("../controller/studentController");
const authenticate = require("../middleware/isAuth");
const upload = require("../utils/multer");
const studentRoute = express.Router();

studentRoute.post("/register", register);
studentRoute.get("/confirmation/:token", verify);
studentRoute.post("/login", login);
studentRoute.get("/stdprofile", authenticate, authentication);
studentRoute.post("/attendance", attendance);
studentRoute.get("/getallstudent", getallStudent);
studentRoute.get("/getattendance", authenticate, getAttendance);
studentRoute.get("/getattendancereport", authenticate, getAttendanceValue);
studentRoute.post("/uploadphoto/:id", upload.single("image"), uploadPhoto);
studentRoute.get("/:id", getPhoto);
studentRoute.patch("/changepassword", change_password);
studentRoute.patch("/changeemail", change_email);

module.exports = studentRoute;
