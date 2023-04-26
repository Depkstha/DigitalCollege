const Token = require("../model/token");
const sendEmail = require("./emailVerification");
const jwt = require("jsonwebtoken");
let refeshToken = async (id, email) => {
	try {
		const emailToken = jwt.sign({ _id: id }, process.env.EMAIL_SECRET);
		const token = new Token({ id: id, token: emailToken });
		await token.save();
		const url = `http://localhost:5000/student/confirmation/${emailToken}`;
		sendEmail(email, url);
		console.log("Email verification mail sent. Please check you inbox");
	} catch (error) {
		console.log("token generation error!!", error);
	}
};
module.exports = refeshToken;
