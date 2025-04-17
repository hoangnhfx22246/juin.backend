const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../utils/sendMail");

const {
  serverErrorResponse,
  conflictErrorResponse,
} = require("../utils/errorResponse");
const saltRounds = 12; // Số lần mã hóa mật khẩu

// Tạo access token
const generateAccessTokens = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.EXPIRES_ACCESS_TOKEN,
  });

  return accessToken;
};
// Tạo refresh token
const generateRefreshTokens = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
  };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
  });

  return refreshToken;
};

// lấy access token mới từ refresh token
// @route POST api/auth/refresh-token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // lấy refresh token từ cookie
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token không hợp lệ" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // giải mã refresh token
    const user = await User.findById(decoded._id); // tìm người dùng theo id trong refresh token
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    const accessToken = generateAccessTokens(user); // tạo access token mới

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi làm mới token:", error);
    return res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};

// Đăng ký người dùng mới
// @route POST api/auth/register
exports.registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictErrorResponse(res, "email", "Email đã tồn tại");
    }

    // mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // tạo người dùng mới
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });
    await newUser.save();

    // tạo token cho người dùng sau khi đăng ký thành công
    const accessToken = generateAccessTokens(newUser);
    const refreshToken = generateRefreshTokens(newUser);

    // lưu refreshToken vào cookie (bảo mật httpOnly)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) * 24 * 60 * 60 * 1000, // Ví dụ: 7 ngày
    });
    return res.status(200).json({
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return serverErrorResponse(res, "Đăng ký không thành công");
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
      return conflictErrorResponse(res, "email", "Email đã tồn tại");
    }
    const isMatch = await bcrypt.compare(password, user.password); // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
    if (!isMatch) {
      return conflictErrorResponse(res, "password", "Mật khẩu không đúng");
    }

    // tạo token cho người dùng
    const accessToken = generateAccessTokens(user); // tạo access token
    const refreshToken = generateRefreshTokens(user); // tạo refresh token

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Chỉ gửi cookie qua HTTPS trong môi trường sản xuất
      sameSite: "Strict",
      maxAge: Number(process.env.MAX_AGE_REFRESH_TOKEN) * 24 * 60 * 60 * 1000, // Thời gian hết hạn của refresh token
    });

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return serverErrorResponse(res, "Đăng nhập không thành công");
  }
};

// Đăng xuất người dùng
// @route POST api/auth/logout
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("refreshToken"); // Xóa cookie refresh token
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    return serverErrorResponse(res, "Đăng xuất không thành công");
  }
};

// Quên mật khẩu
// @route POST api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email, isClientFrontend } = req.body;
  try {
    const user = await User.findOne({ email }); // tìm người dùng theo email
    if (!user) {
      // nếu không tìm thấy người dùng
      return conflictErrorResponse(res, "email", "Email không tồn tại");
    }

    // tạo token reset password
    const payload = {
      _id: user._id,
      email: user.email,
    };
    const resetToken = jwt.sign(payload, process.env.RESET_PASSWORD_SECRET, {
      expiresIn: process.env.EXPIRES_RESET_PASSWORD_TOKEN,
    });

    // gửi email chứa link reset password
    const resetLink = `${
      isClientFrontend ? process.env.CLIENT_URL : process.env.ADMIN_URL
    }/forgot-password/?token=${resetToken}`; // tạo link reset password

    await sendResetPasswordEmail(email, resetLink); // gửi email
    user.resetPasswordToken = resetToken; // lưu token vào cơ sở dữ liệu
    await user.save(); // lưu thay đổi

    return res.json({
      message: "Link khôi phục mật khẩu đã được gửi qua email!",
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    return serverErrorResponse(res, "Cập nhật mật khẩu không thành công");
  }
};

// Đặt lại mật khẩu
// @route POST api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { password, token } = req.body;
  try {
    // giải mã token
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await User.findOne({ email: decoded.email }); // tìm người dùng theo email trong token
    if (!user) {
      return conflictErrorResponse(res, "email", "Email không tồn tại");
    }
    if (user.resetPasswordToken !== token) {
      // nếu token không khớp với token trong cơ sở dữ liệu
      return conflictErrorResponse(
        res,
        "password",
        "Token không hợp lệ hoặc đã hết hạn"
      );
    }
    // mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword; // cập nhật mật khẩu mới
    user.resetPasswordToken = undefined; // xóa token reset password
    await user.save(); // lưu thay đổi

    return res.status(200).json({ message: "Cập nhật mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return serverErrorResponse(res, "Cập nhật mật khẩu không thành công");
  }
};
