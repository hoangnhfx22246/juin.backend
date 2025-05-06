const Category = require("../models/Category");
const { serverErrorResponse } = require("../utils/errorResponse");
const paginate = require("../utils/paginate");
const { default: slugify } = require("slugify");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
exports.getCategories = async (req, res) => {
  try {
    // Lấy số trang và giới hạn từ query params, nếu không có thì mặc định.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    //* Lọc và sắp xếp
    const sortField = req.query.sortField || "createdAt"; // Trường sắp xếp
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // Mặc định: giảm dần
    const search = req.query.search || ""; // Từ khóa tìm kiếm
    const parentId = req.query.parentId || null; // ID danh mục cha

    // Tạo bộ lọc
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (parentId) {
      filter.parentId = parentId;
    }

    // Sắp xếp
    const sort = { [sortField]: sortOrder };

    // Gọi hàm phân trang chung
    const result = await paginate(
      Category,
      filter,
      { path: "parentId", select: "name" },
      page,
      limit,
      sort // bạn quên truyền `sort` ở đây
    );

    // Trả dữ liệu
    return res
      .status(200)
      .json({ categories: result.data, pagination: result.pagination });
  } catch (error) {
    console.error("Lỗi lấy thông tin phân loại:", error);
    return serverErrorResponse(res, "Lỗi lấy thông tin phân loại");
  }
};

exports.postCategories = async (req, res) => {
  const { name, description, parentId } = req.body; // Fixed `req.body` instead of `res.body`

  try {
    if (parentId) {
      const parentCategory = await Category.findById(parentId); // Tìm danh mục cha theo id
      if (parentCategory.parentId) {
        return res.status(400).json({
          message: "Không được chọn phân loại đã có phân loại cha",
        });
      } // Nếu danh mục cha đã có danh mục cha, trả về lỗi
    }

    let image = null;
    // xử lý hình ảnh để update
    if (req.file) {
      // Nếu user đã có avatar, xoá ảnh cũ trên Cloudinary
      // if (updatedUser.avatar && updatedUser.avatar.public_id) {
      //   await cloudinary.uploader.destroy(updatedUser.avatar.public_id);
      // }

      // Upload ảnh mới lên Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        transformation: [{ width: 300, quality: "auto", crop: "scale" }],
      });

      fs.unlinkSync(req.file.path); // Xoá file local sau khi upload

      // Gán lại avatar mới cho user
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const category = new Category({
      name: name,
      slug: slugify(name, { lower: true, strict: true }), // Generate slug from name
      description: description,
      parentId: parentId,
      image: image, // Image URL from Cloudinary
    });

    await category.save(); // Save the category to the database

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};
exports.putCategories = async (req, res) => {
  const { id } = req.params; // Lấy id từ params
  const { name, description, parentId } = req.body; // Fixed `req.body` instead of `res.body`

  try {
    if (parentId) {
      const parentCategory = await Category.findById(parentId); // Tìm danh mục cha theo id
      if (parentCategory.parentId) {
        return res.status(400).json({
          message: "Không được chọn phân loại đã có phân loại cha",
        });
      } // Nếu danh mục cha đã có danh mục cha, trả về lỗi
    }

    const category = await Category.findById(id); // Tìm category theo id
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (parentId && !category.parentId) {
      return res.status(400).json({
        message: "phân loại cha không được trở thành phân loại con",
      });
    }
    // Cập nhật thông tin category

    let image = category.image;
    // xử lý hình ảnh để update
    if (req.file) {
      //* Nếu category đã có image, xoá ảnh cũ trên Cloudinary
      if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      // Upload ảnh mới lên Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        transformation: [{ width: 300, quality: "auto", crop: "scale" }],
      });

      fs.unlinkSync(req.file.path); // Xoá file local sau khi upload

      // Gán lại avatar mới cho user
      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }
    category.name = name; // Cập nhật tên
    category.slug = slugify(name, { lower: true, strict: true }); // Cập nhật slug từ tên
    category.description = description; // Cập nhật mô tả
    category.parentId = parentId; // Cập nhật parentId
    category.image = image; // Cập nhật ảnh
    await category.save(); // Lưu category vào database

    await category.save(); // Save the category to the database

    return res.status(201).json({
      message: "Category update successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      message: "Error creating category",
      error: error.message,
    });
  }
};

exports.deleteCategories = async (req, res) => {
  const { id } = req.params; // Lấy id từ params

  try {
    const category = await Category.findById(id); // Tìm category theo id
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Kiểm tra xem category có danh mục con hay không
    const subCategories = await Category.find({ parentId: id });
    if (subCategories.length > 0) {
      return res
        .status(400)
        .json({
          message: "Không thể xóa danh mục này vì đang có danh mục con",
        });
    } // Nếu có danh mục con, trả về lỗi

    // Xoá ảnh trên Cloudinary nếu có
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await Category.findByIdAndDelete(id); // Xoá category khỏi database

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      message: "Error deleting category",
      error: error.message,
    });
  }
};

//* Lấy danh sách danh mục con theo id danh mục cha
exports.getSubCategories = async (req, res) => {
  const { parentId } = req.params; // Lấy id từ params

  try {
    const subCategories = await Category.find({ parentId: parentId }); // Tìm danh mục con theo parentId
    return res.status(200).json({
      message: "Subcategories retrieved successfully",
      subCategories,
    });
  } catch (error) {
    console.error("Error retrieving subcategories:", error);
    return res.status(500).json({
      message: "Error retrieving subcategories",
      error: error.message,
    });
  }
};

//* Lấy danh sách danh mục cha
exports.getParentCategories = async (req, res) => {
  try {
    const parentCategories = await Category.find({ parentId: null }); // Tìm danh mục cha

    return res.status(200).json({
      message: "Parent categories retrieved successfully",
      parentCategories,
    });
  } catch (error) {
    console.error("Error retrieving parent categories:", error);
    return res.status(500).json({
      message: "Error retrieving parent categories",
      error: error.message,
    });
  }
};
exports.getCategoriesWithChildren = async (req, res) => {
  try {
    // Lấy tất cả danh mục cha
    const parentCategories = await Category.find({ parentId: null });

    // Với mỗi danh mục cha, lấy danh mục con tương ứng
    const categoriesWithChildren = await Promise.all(
      parentCategories.map(async (parent) => {
        const subCategories = await Category.find({ parentId: parent._id });

        return {
          ...parent.toObject(),
          subCategories,
        };
      })
    );

    return res.status(200).json({
      message: "Categories with subcategories retrieved successfully",
      data: categoriesWithChildren,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    return res.status(500).json({
      message: "Error retrieving categories",
      error: error.message,
    });
  }
};
//* Lấy danh sách danh mục cha
exports.getParentCategories = async (req, res) => {
  try {
    const parentCategories = await Category.find({ parentId: null }); // Tìm danh mục cha

    return res.status(200).json({
      message: "Parent categories retrieved successfully",
      parentCategories,
    });
  } catch (error) {
    console.error("Error retrieving parent categories:", error);
    return res.status(500).json({
      message: "Error retrieving parent categories",
      error: error.message,
    });
  }
};
