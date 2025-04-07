import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectCloudinary from "./config/cloudinary.js";
import connectDB from "./config/mongodb.js";
import orderRoute from "./routes/orderRoute.js";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: ['https://clone-e-commerce-khaki.vercel.app', 'http://localhost:3000', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// Connect to MongoDB
connectDB();
connectCloudinary();

// API Endpoints
app.use("/api/user", userRoute);
app.use("/api/products", productRoute);
app.use("/api/order", orderRoute);

app.get("/", (req, res) => {
    res.status(200).json({ message: "API Working" });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

// Export for Vercel
export default app;
