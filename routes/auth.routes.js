const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  resetPassword,
  forgotPassword,
} = require("../controllers/auth.controller"); // Import the controller function for user registration
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../middlewares/validation/auth.validation"); // Import the validation middleware
const validateRequest = require("../middlewares/validation/validateRequest"); // Import the request validation middleware
const refreshTokenLimiter = require("../middlewares/security/refreshTokenLimiter");
const csrfProtection = require("../middlewares/security/csrfProtection");
const loginLimiter = require("../middlewares/security/loginLimiter");

// ROUTES

router.get("/csrf-token", csrfProtection, (req, res) => {
  return res.status(200).json({ csrfToken: req.csrfToken() });
});
// @route POST api/auth/register
router.post("/register", registerValidation, validateRequest, registerUser);
// @route POST api/auth/login
router.post(
  "/login",
  loginValidation,
  loginLimiter,
  validateRequest,
  loginUser
);
// @route POST api/auth/logout
router.post("/logout", logoutUser);
// @route POST api/auth/refresh-token
router.post(
  "/refresh-token",
  csrfProtection,
  // refreshTokenLimiter,
  refreshToken
); // Đường dẫn cho việc làm mới token

// @route POST api/auth/forgot-password
router.post(
  "/forgot-password",
  refreshTokenLimiter,
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
); // Đường dẫn cho việc quên mật khẩu
// @route POST api/auth/reset-password
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  csrfProtection,
  resetPassword
); // Đường dẫn cho việc đặt lại mật khẩu

module.exports = router;
