const { body } = require("express-validator");

/// Middleware để xác thực dữ liệu đầu vào cho đăng ký người dùng
const categoryValidation = [
  body("name").notEmpty().withMessage("Hãy điền tiêu đề phân loại"),
  body("description").notEmpty().withMessage("Hãy điền thông tin chi tiết"),
];

module.exports = { categoryValidation };
