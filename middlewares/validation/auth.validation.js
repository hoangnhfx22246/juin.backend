const { body } = require("express-validator");

/// Middleware để xác thực dữ liệu đầu vào cho đăng ký người dùng
const registerValidation = [
  body("email")
    .notEmpty()
    .withMessage("Hãy điền email")
    .isEmail()
    .withMessage("Hãy nhập đúng định dạng email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Hãy điền mật khẩu")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải ít nhất 6 ký tự")
    .matches(/[a-z]/)
    .withMessage("Phải có chữ thường")
    .matches(/[A-Z]/)
    .withMessage("Phải có chữ hoa")
    .matches(/[0-9]/)
    .withMessage("Phải có số")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Phải có ký tự đặc biệt"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Hãy điền lại mật khẩu")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu không khớp");
      }
      return true;
    }),
  body("name").notEmpty().withMessage("Hãy điền tên"),
  body("phone")
    .notEmpty()
    .withMessage("Hãy điền số điện thoại")
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),
];

// Middleware để xác thực dữ liệu đầu vào cho đăng nhập người dùng
const loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Hãy điền email")
    .isEmail()
    .withMessage("Hãy nhập đúng định dạng email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Hãy điền mật khẩu"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
