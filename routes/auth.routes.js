const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/auth.controller"); // Import the controller function for user registration
const {
  registerValidation,
  loginValidation,
} = require("../middlewares/validation/auth.validation"); // Import the validation middleware
const validateRequest = require("../middlewares/validation/validateRequest"); // Import the request validation middleware

router.post("/register", registerValidation, validateRequest, registerUser);
router.post("/login", loginValidation, validateRequest, loginUser);

module.exports = router;
