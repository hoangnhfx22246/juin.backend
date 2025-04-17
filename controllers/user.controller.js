const User = require("../models/User");
const { serverErrorResponse } = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = req.user; // thông tin người dùng từ access token
  if (!user) {
    return res.status(403).json({ message: "Người dùng không hợp lệ" });
  }
  // Chỉ có admin hoặc chính người dùng đó mới có quyền truy cập
  if (user._id !== id && user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  try {
    // Tìm người dùng theo id
    const userData = await User.findById(id).select("-password -refreshToken"); // loại bỏ password và refreshToken
    if (!userData) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    return res.status(200).json(userData);
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    return serverErrorResponse(res, "Lỗi lấy thông tin người dùng");
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, email, avatar, sex, birthday } = req.body; // lấy thông tin từ request body
  const user = req.user; // thông tin người dùng từ access token
  if (!user) {
    return res.status(403).json({ message: "Người dùng không hợp lệ" });
  }
  // Chỉ có admin hoặc chính người dùng đó mới có quyền truy cập
  if (user._id !== id && user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  try {
    // Cập nhật thông tin người dùng
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    // Cập nhật thông tin người dùng
    //nếu là admin thì có thể cập nhật tất cả thông tin
    //nếu không phải admin thì chỉ có thể cập nhật tên, ảnh đại diện, giới tính và ngày sinh
    if (user.role === "admin") {
      updatedUser.role = role;
      updatedUser.email = email;
    }
    updatedUser.name = name;
    if (sex) {
      updatedUser.sex = sex;
    }
    updatedUser.birthday = birthday;
    // xử lý hình ảnh để update
    if (req.file) {
      // Nếu user đã có avatar, xoá ảnh cũ trên Cloudinary
      if (updatedUser.avatar && updatedUser.avatar.public_id) {
        await cloudinary.uploader.destroy(updatedUser.avatar.public_id);
      }

      // Upload ảnh mới lên Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
        transformation: [{ width: 300, quality: "auto", crop: "scale" }],
      });

      fs.unlinkSync(req.file.path); // Xoá file local sau khi upload

      // Gán lại avatar mới cho user
      updatedUser.avatar = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    await updatedUser.save(); // lưu thông tin người dùng đã cập nhật vào cơ sở dữ liệu
    //xoá refreshToken của người dùng khi gửi thông tin về cho frontend
    //xoá password của người dùng khi gửi thông tin về cho frontend
    const userObject = updatedUser.toObject(); // chuyển về plain object
    delete userObject.password;
    delete userObject.refreshToken;
    // gửi phản hồi thành công
    return res.status(200).json(userObject);
  } catch (error) {
    console.error("Lỗi cập nhật thông tin người dùng:", error);
    return serverErrorResponse(res, "Lỗi cập nhật thông tin người dùng");
  }
};
