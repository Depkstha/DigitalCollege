const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectDB } = require("./src/db/database");
const path = require("path");
const device = require("express-device");
const studentRoute = require("./src/route/studentRoute");
const feeRoute = require("./src/route/feeRoute");
const adminRoute = require("./src/route/adminRoute");
const corsOptions = require("../server/config/corsOptions");
const task = require("./src/utils/attendance_schedule");
const task1 = require("./src/utils/getholiday");

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "uploads")));

task.start();
task1.start();

app.use(device.capture());
app.use(cors(corsOptions));

connectDB();

app.get("/", (req, res) => {
  res.json("Welcome to College Management System");
  console.log(req.device.type.toUpperCase());
});

app.use("/student", studentRoute);
app.use("/fee", feeRoute);
app.use("/admin", adminRoute);

module.exports = app;
