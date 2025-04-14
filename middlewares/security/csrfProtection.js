const csrf = require("csurf");

const csrfProtection = csrf({
  cookie: {
    httpOnly: false, // Cho phép frontend đọc được để gửi kèm
    secure: process.env.NODE_ENV === "production", // Chỉ gửi cookie qua HTTPS trong môi trường sản xuất
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax", // Lax cho phép hoạt động dev dễ hơn,Strict Tránh gửi cookie cross-site
  },
});

module.exports = csrfProtection;
