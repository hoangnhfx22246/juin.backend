// middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // chỉ cho gọi 10 lần mỗi 15 phút
  message: "Quá nhiều yêu cầu làm mới token. Vui lòng thử lại sau.",
});

module.exports = refreshTokenLimiter;
