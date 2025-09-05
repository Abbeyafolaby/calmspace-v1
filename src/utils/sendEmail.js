const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
service: "gmail", // or SMTP service like SendGrid
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
}
});

async function sendEmail(to, subject, text) {
await transporter.sendMail({
from: `"Auth System" <${process.env.EMAIL_USER}>`,
to,
subject,
text
});
}

module.exports = sendEmail;
