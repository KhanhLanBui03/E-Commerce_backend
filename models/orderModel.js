import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        }
    ],
    address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Stripe', 'Razorpay']
    },
    paymentStatus: {
        type: String,
        default: 'Unpaid',
        enum: ['Unpaid', 'Paid', 'Refunded']
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Processing',
        enum: ['Processing', 'Shipping', 'Delivered', 'Cancelled']
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel; 