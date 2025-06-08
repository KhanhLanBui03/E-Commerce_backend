const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/order', orderRoutes);

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch(err => console.error('Lỗi kết nối MongoDB:', err));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
}); 