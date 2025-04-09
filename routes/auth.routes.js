const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/auth.controller"); // Import the controller function for user registration
const {
  registerValidation,
} = require("../middlewares/validation/auth.validation"); // Import the validation middleware
const validateRequest = require("../middlewares/validation/validateRequest"); // Import the request validation middleware

router.post("/register", registerValidation, validateRequest, registerUser);

module.exports = router;
