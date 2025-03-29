import mongoose from 'mongoose';
import orderModel from "../models/orderModel.js";

// Lấy tất cả đơn hàng
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("userId", "name email")
      .sort({ orderDate: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.json({ success: false, message: "ID đơn hàng không hợp lệ" });
    }

    const validStatuses = [
      "Đang xử lý",
      "Đang giao hàng",
      "Đã giao hàng",
      "Đã hủy",
    ];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
};

// Xuất đơn hàng theo ID
export const exportOrder = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.orderId)
      .populate("userId", "name email");
    
    if (!order) {
      return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Lỗi khi xuất đơn hàng:", error);
    res.json({ success: false, message: error.message });
  }
};

// Xuất đơn hàng theo khoảng thời gian
export const exportOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    const orders = await orderModel.find({
      orderDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate("userId", "name email");

    if (!orders.length) {
      return res.json({ 
        success: false, 
        message: "Không tìm thấy đơn hàng trong khoảng thời gian này" 
      });
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi khi xuất đơn hàng theo khoảng thời gian:", error);
    res.json({ success: false, message: error.message });
  }
}; 