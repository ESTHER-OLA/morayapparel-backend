// testEmail.js
const transporter = require("./config/transporter");

transporter
  .sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Test Email",
    text: "If you're seeing this, transporter works!",
  })
  .then(() => console.log("Email sent successfully!"))
  .catch((error) => console.error("Transporter error:", error));
