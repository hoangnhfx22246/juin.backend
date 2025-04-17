const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Token không hợp lệ!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded; // lưu thông tin user vào req
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Access Token hết hạn hoặc không hợp lệ!" });
  }
};

module.exports = verifyAccessToken;
