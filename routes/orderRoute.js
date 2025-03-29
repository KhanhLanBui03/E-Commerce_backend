import express from "express";
import mongoose from "mongoose";
import {
    exportOrder,
    exportOrdersByDateRange,
    getAllOrders,
    updateOrderStatus
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import orderModel from "../models/orderModel.js";

const orderRoute = express.Router();

// API for creating an order
orderRoute.post("/create", userAuth, async (req, res) => {
  try {
    const { products, address, paymentMethod, totalAmount } = req.body;
    const userId = req.userId;

    const orderData = {
      userId,
      products,
      address,
      paymentMethod,
      totalAmount,
      status: "Đang xử lý",
      orderDate: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.json({
      success: true,
      message: "Đơn hàng đã được tạo thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
});

// API for getting all orders (admin only)
orderRoute.get("/all", adminAuth, getAllOrders);

// API for getting orders of a specific user
orderRoute.get("/user-orders", userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId }).sort({ orderDate: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của người dùng:", error);
    res.json({ success: false, message: error.message });
  }
});

// API for updating order status (admin only)
orderRoute.patch("/update-status", adminAuth, updateOrderStatus);

// API for getting a specific order
orderRoute.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "ID đơn hàng không hợp lệ" });
    }

    const order = await orderModel
      .findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "name price image");

    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
});

// API for cancelling an order (user)
orderRoute.patch("/cancel", userAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.json({ success: false, message: "ID đơn hàng không hợp lệ" });
    }

    const order = await orderModel.findOne({ _id: orderId, userId });

    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "Đang xử lý") {
      return res.json({
        success: false,
        message: "Chỉ có thể hủy đơn hàng ở trạng thái đang xử lý",
      });
    }

    order.status = "Đã hủy";
    order.updatedAt = Date.now();
    await order.save();

    res.json({ success: true, message: "Hủy đơn hàng thành công", order });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
});

// API for exporting an order by ID
orderRoute.get("/export/:orderId", exportOrder);

// API for exporting orders by date range
orderRoute.post("/export-by-date", exportOrdersByDateRange);

export default orderRoute;
