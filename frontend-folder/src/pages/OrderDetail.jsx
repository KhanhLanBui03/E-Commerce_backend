import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { backendUrl } = useContext(ShopContext);
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view order details');
      navigate('/login');
      return;
    }

    fetchOrderDetail();
  }, [orderId, token, navigate]);

  const fetchOrderDetail = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/detail/${orderId}`, {
        headers: { token }
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error(response.data.message || 'Could not fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error('An error occurred while fetching order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipping':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <button 
            onClick={() => navigate('/orders')}
            className="text-purple-600 hover:text-purple-800"
          >
            Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Order Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Order ID:</span> #{order._id.slice(-6)}</p>
                <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </p>
                <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                <p><span className="font-medium">Payment Status:</span> {order.paymentStatus}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-2">
                <p>{order.address.name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.address}</p>
                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                <p>{order.address.country}</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div key={index} className="flex items-center gap-4 border-b pb-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-gray-600">Size: {product.size}</p>
                    <p className="text-gray-600">Quantity: {product.quantity}</p>
                    <p className="font-medium">${product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end items-center gap-4">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold">${order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 