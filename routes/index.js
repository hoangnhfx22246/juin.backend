const express = require("express");
const router = express.Router();

const uploadRoutes = require("./upload.routes");
const authRoutes = require("./auth.routes");

router.use("/uploads", uploadRoutes);
router.use("/auth", authRoutes);

module.exports = router;
