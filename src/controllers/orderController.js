const Order = require('../models/Order');

// Lấy tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(200).json({ message: 'Cập nhật trạng thái thành công', order });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
  }
};

// Xuất đơn hàng theo ID
exports.exportOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xuất đơn hàng', error: error.message });
  }
};

// Xuất đơn hàng theo khoảng thời gian
exports.exportOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    const orders = await Order.find({
      orderDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('userId', 'name email');

    if (!orders.length) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng trong khoảng thời gian này' });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xuất đơn hàng theo khoảng thời gian', error: error.message });
  }
}; 