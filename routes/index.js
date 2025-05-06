const express = require("express");
const router = express.Router();

const uploadRoutes = require("./upload.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoryRouter = require("./category.routes");
// const csrfProtection = require("../middlewares/security/csrfProtection");

// router.use(csrfProtection);
router.use("/uploads", uploadRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/categories", categoryRouter);

module.exports = router;
