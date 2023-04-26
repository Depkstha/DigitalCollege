const nodemailer = require("nodemailer");
const sendEmail1 = (email) => {
	try {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: process.env.HOST,
			port: process.env.EMAIL_PORT,
			tls: {
				rejectUnauthorized: true,
			},
			auth: {
				user: process.env.SENDER_EMAIL,
				pass: process.env.APP_PASSWORD,
			},
		});
		const date = new Date();
		const mailOptions = {
			from: process.env.SENDER_MAIL,
			to: email,
			subject: "Fee Remainder Notice",
			html: `<p>Exam for is Open from today.<br>
					${date}<br>
					<br>
					Please Clear your due before exam. Thankyou!
					<br>
					Inquiries:Birendra Memorial College.<br>
					Sunsari,Nepal<br>
					www.bmccollege.com.np</p>`,
		};
		transporter.sendMail(mailOptions, (error, response) => {
			if (error) console.log("Failed to send verification link", error);
			else
				console.log(
					"verification mail sent successfully. Please check your inbox.",
					response
				);
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = sendEmail1;
