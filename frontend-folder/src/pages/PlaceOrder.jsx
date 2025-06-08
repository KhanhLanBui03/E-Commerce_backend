import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const PlaceOrder = () => {
  const { currency, getCartAmount, delivery_fee, cartItems, backendUrl } = useContext(ShopContext);
  const [cartAmount, setCartAmount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    const fetchCartAmount = async () => {
      try {
        const amount = await getCartAmount();
        setCartAmount(amount);
      } catch (error) {
        console.error("Error calculating cart total:", error);
        setCartAmount(0);
      }
    };
    
    fetchCartAmount();
  }, [getCartAmount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'country', 'cardNumber', 'cardName', 'expiryDate', 'cvv'];
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check cart
    if (Object.keys(cartItems).length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    // Process payment
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to place order');
        return;
      }

      // Prepare order data
      const orderProducts = [];
      
      // Process each product in cart
      for (const [productId, itemData] of Object.entries(cartItems)) {
        if (!itemData || !itemData.product || !itemData.sizes) {
          console.error("Invalid product data:", productId, itemData);
          continue;
        }

        const product = itemData.product;
        
        // Process each size of the product
        for (const [size, quantity] of Object.entries(itemData.sizes)) {
          if (quantity > 0) {
            orderProducts.push({
              productId: product._id,
              name: product.name,
              quantity: Number(quantity),
              price: Number(product.price),
              size: size,
              image: product.image[0]
            });
          }
        }
      }

      if (orderProducts.length === 0) {
        throw new Error('No products in cart');
      }

      // Create order data according to API requirements
      const orderData = {
        products: orderProducts,
        address: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.postalCode || '000000',
          country: formData.country
        },
        paymentMethod: 'COD',
        totalAmount: cartAmount + delivery_fee
      };

      console.log("Order data being sent:", orderData);

      // Call API to create order
      const response = await axios.post(
        `${backendUrl}/api/order/create`,
        orderData,
        {
          headers: {
            token: token,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Server response:", response.data);

      if (response.data.success) {
        // Clear cart after successful order
        localStorage.removeItem('cartItems');
        setShowSuccessModal(true);
        toast.success('Order placed successfully!');
      } else {
        throw new Error(response.data.message || 'Error creating order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error(error.response?.data?.message || error.message || 'Unable to create order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Order Information</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Shipping Address</h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="address"
              placeholder="Address *"
              value={formData.address}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={formData.city}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="state"
                placeholder="State/Province *"
                value={formData.state}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code *"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="country"
                placeholder="Country *"
                value={formData.country}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Payment Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number *"
              value={formData.cardNumber}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="cardName"
              placeholder="Cardholder Name *"
              value={formData.cardName}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="expiryDate"
                placeholder="Expiry Date (MM/YY) *"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV *"
                value={formData.cvv}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span>{currency}{cartAmount}.00</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span>Shipping Fee:</span>
            <span>{currency}{delivery_fee}.00</span>
          </div>
          <div className="flex justify-between items-center font-bold">
            <span>Total:</span>
            <span>{currency}{cartAmount + delivery_fee}.00</span>
          </div>
        </div>

        {/* Order Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
            <p className="mb-6">Thank you for your purchase. We will contact you soon.</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                window.location.href = '/';
              }}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
