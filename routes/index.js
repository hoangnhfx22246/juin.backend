const express = require("express");
const router = express.Router();

const uploadRoutes = require("./upload.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoryRouter = require("./category.routes");

router.use("/uploads", uploadRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/category", categoryRouter);

module.exports = router;
