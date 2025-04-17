const Category = require("../models/Category");
const { serverErrorResponse } = require("../utils/errorResponse");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate("parentId", "name");
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Lỗi lấy thông tin phân loại:", error);
    return serverErrorResponse(res, "Lỗi lấy thông tin phân loại");
  }
};
