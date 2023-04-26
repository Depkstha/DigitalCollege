const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
	id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Student",
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		expires: 600,
		default: Date.now(),
	},
});
const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;
