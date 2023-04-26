const express = require("express");
const {
	verifypayment,
	updateFeesManually
} = require("../controller/feeController");
const feeRoute = express.Router();

feeRoute.post("/verifypayment", verifypayment);
feeRoute.post("/updatefees", updateFeesManually);
module.exports = feeRoute;
