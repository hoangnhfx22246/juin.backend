const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");

// const bodyParser = require("body-parser"); không cần nữa vì express đã có body-parser tích hợp sẵn
const routes = require("./routes");

const dotenv = require("dotenv"); // Import dotenv để sử dụng biến môi trường
dotenv.config(); // Load biến môi trường từ file .env

const app = express();

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ Middleware để parse JSON body
app.use(express.urlencoded({ extended: true })); // Sử dụng express.urlencoded() để parse URL-encoded request body

// Dùng route index
app.use("/api", routes); // Tất cả API sẽ bắt đầu với /api

(async () => {
  try {
    // Kết nối đến MongoDB
    connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1); // Dừng server nếu không kết nối được đến MongoDB
  }
})();
// Kết nối đến MongoDB
// connectDB();

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
