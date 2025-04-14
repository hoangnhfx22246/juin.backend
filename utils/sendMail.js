const nodemailer = require("nodemailer");

exports.sendResetPasswordEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // tài khoản Gmail của bạn
      pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng Gmail
    },
  });

  const mailOptions = {
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Khôi phục mật khẩu",
    html: `
      <h3>Yêu cầu khôi phục mật khẩu</h3>
      <p>Click vào link dưới đây để đặt lại mật khẩu của bạn:</p>
      <a href="${resetLink}">Đặt lại mật khẩu</a>
      <p>Link có hiệu lực trong 15 phút.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
