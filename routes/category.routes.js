const express = require("express");
const router = express.Router();

const {
  getCategories,
  postCategories,
  putCategories,
  deleteCategories,
  getParentCategories,
  getCategoriesWithChildren,
} = require("../controllers/category.controller");
const csrfProtection = require("../middlewares/security/csrfProtection");
const verifyAccessToken = require("../middlewares/security/verifyAccessToken");
const {
  categoryValidation,
} = require("../middlewares/validation/category.validation");
const validateRequest = require("../middlewares/validation/validateRequest");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

// @route GET api/category/
router.get("/", verifyAccessToken, getCategories);
// @route POST api/category/
router.post(
  "/",
  csrfProtection,
  verifyAccessToken,
  upload.single("image"),
  categoryValidation,
  validateRequest,
  postCategories
);
// @route put api/category/
router.put(
  "/:id",
  csrfProtection,
  verifyAccessToken,
  upload.single("image"),
  categoryValidation,
  validateRequest,
  putCategories
);
// @route delete api/category/
router.delete("/:id", csrfProtection, verifyAccessToken, deleteCategories);

//dùng cho trang người dùng
// lấy danh sách danh mục cha chứa danh sách danh mục con
// @route GET api/category/sub
router.get("/sub", getCategoriesWithChildren);
//lấy danh sách danh mục cha
// @route GET api/category/parent
router.get("/parents", getParentCategories);

module.exports = router;
