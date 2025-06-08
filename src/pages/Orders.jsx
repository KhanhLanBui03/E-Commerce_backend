import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(null)
  const [selectedTab, setSelectedTab] = useState('orders') // 'orders' or 'stats'
  const { backendUrl } = useContext(ShopContext)
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const token = localStorage.getItem('token')

  const handleShopping = () => {
    navigate('/');
  }

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view orders')
      navigate('/login')
      return
    }

    // Fetch orders
    fetchOrders()

    // Fetch admin stats if admin
    if (isAdmin) {
      fetchAdminStats()
    }
  }, [token, isAdmin, backendUrl, navigate])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // For admin, get all orders
      // For user, get only their orders
      const endpoint = isAdmin ? 'api/order/all' : 'api/order/user-orders'
      const response = await axios.get(`${backendUrl}/${endpoint}`, {
        headers: { 
          token: token
        }
      })

      if (response.data.success) {
        setOrders(response.data.orders || [])
      } else {
        toast.error(response.data.message || 'Could not fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
        navigate('/login')
      } else {
        toast.error('An error occurred while fetching orders')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/admin/stats`, {
        headers: { 
          token: token
        }
      })

      if (response.data.success) {
        setStats(response.data.stats)
      } else {
        toast.error(response.data.message || 'Could not fetch statistics')
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
        navigate('/login')
      }
    }
  }

  // Function to export order as JSON
  const exportOrder = async (orderId) => {
    try {
      setExportLoading(true);
      // Tìm order cần export
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }

      // Tạo dữ liệu để export
      const exportData = {
        orderId: order._id,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        status: order.status,
        products: order.products,
        address: order.address,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      };

      // Chuyển đổi thành JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Tạo blob và download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_${orderId}_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Order exported successfully');
    } catch (error) {
      console.error('Error exporting order:', error);
      toast.error('Could not export order');
    } finally {
      setExportLoading(false);
    }
  };

  // Function to cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      setCancelLoading(orderId);
      const response = await axios.patch(`${backendUrl}/api/order/cancel`, 
        { orderId }, 
        { 
          headers: { 
            token: token
          } 
        }
      );
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        // Refresh order list
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Could not cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
        navigate('/login')
      } else {
        toast.error('An error occurred while cancelling order');
      }
    } finally {
      setCancelLoading(null);
    }
  };

  // Admin section components
  const AdminTabs = () => (
    <div className="flex border-b mb-6">
      <button 
        className={`py-2 px-4 ${selectedTab === 'orders' ? 'border-b-2 border-purple-500 font-bold' : ''}`}
        onClick={() => setSelectedTab('orders')}
      >
        Order Management
      </button>
      <button 
        className={`py-2 px-4 ${selectedTab === 'stats' ? 'border-b-2 border-purple-500 font-bold' : ''}`}
        onClick={() => setSelectedTab('stats')}
      >
        Statistics
      </button>
      <button 
        className={`py-2 px-4 ${selectedTab === 'products' ? 'border-b-2 border-purple-500 font-bold' : ''}`}
        onClick={() => setSelectedTab('products')}
      >
        Product Management
      </button>
    </div>
  )

  const AdminStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Revenue</h3>
            <p className="text-2xl font-bold">${stats.totalRevenue}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500">Pending Orders</h3>
            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )

  const ProductsList = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Products list</h3>
      <p className="text-gray-500">No context, can not connect to api.</p>
    </div>
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
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

  return (
    <div className="min-h-[80vh] py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{isAdmin ? 'Management' : 'Your Orders'}</h1>
        
        {/* Admin sections */}
        {isAdmin && (
          <>
            <AdminTabs />
            {selectedTab === 'stats' && <AdminStats />}
            {selectedTab === 'products' && <ProductsList />}
          </>
        )}
        
        {/* Orders section - for both admin and normal users */}
        {selectedTab === 'orders' && (
          <>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : orders.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">#{order._id.slice(-6)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(order.orderDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Number(order.totalAmount).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        {isAdmin && <td className="px-6 py-4 whitespace-nowrap">{order.userId?.name || 'N/A'}</td>}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/order-detail/${order._id}`)}
                          >
                            View
                          </button>
                          
                          <button 
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            onClick={() => exportOrder(order._id)}
                            disabled={exportLoading}
                            title="Export Order"
                          >
                            {exportLoading ? (
                              <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </button>
                          
                          {order.status === 'Processing' && (
                            <button 
                              className="text-red-600 hover:text-red-900 flex items-center"
                              onClick={() => cancelOrder(order._id)}
                              disabled={cancelLoading === order._id}
                            >
                              {cancelLoading === order._id ? (
                                <div className="animate-spin h-4 w-4 border-t-2 border-red-500 rounded-full"></div>
                              ) : 'Cancel'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">You have no orders yet.</p>
                {!isAdmin && (
                  <button onClick={handleShopping} className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Shop Now
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Orders
