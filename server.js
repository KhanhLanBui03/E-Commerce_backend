import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import orderRoute from "./routes/orderRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";

// Load biến môi trường
dotenv.config();

// Kiểm tra biến môi trường
console.log("MONGODB_URI:", process.env.MONGODB_URI);

// Kết nối MongoDB
connectDB();
connectCloudinary();
// App Config
const app = express();
const port = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user",userRoute);
app.use("/api/products",productRoute);
app.use("/api/order", orderRoute);

app.get("/", (req, res) => {
    res.send("API Working");
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
app.use(express.json()); // ✅ Hỗ trợ dữ liệu JSON
app.use(express.urlencoded({ extended: true })); // ✅ Hỗ trợ form data
