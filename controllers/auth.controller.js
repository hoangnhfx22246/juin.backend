const bcrypt = require("bcryptjs");
const User = require("../models/User");
const saltRounds = 12; // Số lần mã hóa mật khẩu

// Đăng ký người dùng mới
// @route POST api/auth/register
exports.registerUser = async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    // kiểm tra email đã tồn tại chưa
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds); // mã hóa mật khẩu

    // tạo người dùng mới
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone,
    });
    await newUser.save();

    return res.status(200).json({
      email,
      password,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Đăng ký không thành công" });
  }
};

// Đăng nhập người dùng
// @route POST api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }
    const isMatch = await bcrypt.compare(password, user.password); // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // tạo token cho người dùng
    const acceptToken = await user.generateAuthToken(); // Giả sử bạn đã định nghĩa phương thức này trong model User
    return res.status(200).json({
      token: acceptToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res.status(500).json({ message: "Đăng nhập không thành công" });
  }
};
