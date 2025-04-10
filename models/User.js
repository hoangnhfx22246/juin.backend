const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dr3w2fwji/image/upload/v1744174732/man_msghl7.png",
    },
    sex: {
      type: Boolean,
    },
    birthday: {
      type: Date,
    },
    addressBook: [
      {
        name: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "consultant"],
      default: "user",
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Tạo token xác thực cho người dùng
UserSchema.methods.generateAuthToken = function () {
  const payload = {
    _id: this._id,
    email: this.email,
    name: this.name,
    phone: this.phone,
    role: this.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
  return token;
};

module.exports = mongoose.model("User", UserSchema);
