const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.uploadImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "uploads",
      transformation: [{ width: 800, quality: "auto", crop: "scale" }],
    });

    // Xoá file tạm local sau khi upload
    fs.unlinkSync(filePath);
    res.json({
      message: "Upload thành công!",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload lỗi", error);
    res.status(500).json({ message: "Lỗi upload ảnh" });
  }
};
