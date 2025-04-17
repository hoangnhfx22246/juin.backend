const express = require("express");
const { getUser, updateUser } = require("../controllers/user.controller");
const csrfProtection = require("../middlewares/security/csrfProtection");
const refreshTokenLimiter = require("../middlewares/security/refreshTokenLimiter");
const verifyAccessToken = require("../middlewares/security/verifyAccessToken");
const router = express.Router();
const multer = require("multer");

// Cấu hình multer lưu tạm ảnh vào thư mục uploads/
const upload = multer({ dest: "uploads/" });

// @route GET api/user/:id
router.get("/:id", csrfProtection, verifyAccessToken, getUser);
// @route patch api/user/:id
router.patch(
  "/:id",
  csrfProtection,
  verifyAccessToken,
  upload.single("avatar"),
  updateUser
);

module.exports = router;
