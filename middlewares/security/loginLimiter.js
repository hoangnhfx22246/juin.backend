const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // chỉ cho gọi 100 lần mỗi 15 phút
  message: "Nhập sai mật khẩu quá nhiều. Vui lòng thử lại sau.",
});

module.exports = loginLimiter;
