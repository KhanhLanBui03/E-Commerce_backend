const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Lấy tất cả đơn hàng
router.get('/all', orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng
router.patch('/update-status', orderController.updateOrderStatus);

// Xuất đơn hàng theo ID
router.get('/export/:orderId', orderController.exportOrder);

// Xuất đơn hàng theo khoảng thời gian
router.post('/export-by-date', orderController.exportOrdersByDateRange);

module.exports = router; 