const express = require("express");
const router = express.Router();

const { getAllCategories } = require("../controllers/category.controller");
const csrfProtection = require("../middlewares/security/csrfProtection");

// @route GET api/category/
router.get("/", getAllCategories);

module.exports = router;
