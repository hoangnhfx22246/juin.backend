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
    avatar: {
      type: String,
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
    resetPasswordToken: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);
