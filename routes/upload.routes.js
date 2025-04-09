const express = require("express");
const router = express.Router();
const { uploadImage } = require("../controllers/upload.controller");
const multer = require("multer");

// Cấu hình multer lưu tạm ảnh vào thư mục uploads/
const upload = multer({ dest: "uploads/" });

router.post("/upload-image", upload.single("image"), uploadImage); // POST /api/uploads/upload-image

module.exports = router;
