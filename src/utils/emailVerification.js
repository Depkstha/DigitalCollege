const nodemailer = require("nodemailer");
const sendEmail = (email, url) => {
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
			subject: "Verify your email account",
			html: `<p>Thank you for Signing up!.<br>
					${date}<br>
					<br>
					Email Confirmation link<br>
					<br>
					${url}<br>
					<br>
					This URL is valid for 60 minutes.<br>
					<br>
					This email has been automatically sent from the BMC Portal site.<br>
					This is an automated email response and cannot be replied to.<br>
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

module.exports = sendEmail;
