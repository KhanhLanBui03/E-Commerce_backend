import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { backendUrl } from '../App';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      filterOrdersByDateRange();
    } else {
      setFilteredOrders(Array.isArray(orders) ? orders : []);
    }
  }, [dateRange, orders]);

  const getOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get(`${backendUrl}/api/order/all`, {
        headers: {
          token: token
        }
      });
      if (response.status === 200) {
        const ordersData = Array.isArray(response.data.orders) ? response.data.orders : [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      }
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDateRange = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.post(`${backendUrl}/api/order/export-by-date`, dateRange, {
        headers: {
          token: token
        }
      });
      if (response.status === 200) {
        const filteredData = Array.isArray(response.data.orders) ? response.data.orders : [];
        setFilteredOrders(filteredData);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      }
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setStatusLoading(orderId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await axios.patch(
        `${backendUrl}/api/order/update-status`, 
        {
          orderId,
          status: newStatus
        },
        {
          headers: {
            token: token
          }
        }
      );
      
      if (response.status === 200 && response.data.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        setFilteredOrders(prevFilteredOrders => 
          prevFilteredOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        toast.success('Order status updated successfully');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setStatusLoading(null);
    }
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

  const exportOrder = async (orderId) => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get(`${backendUrl}/api/order/export/${orderId}`, {
        responseType: 'blob',
        headers: {
          token: token
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_${orderId}_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Order exported successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setExportLoading(false);
    }
  };

  const exportOrdersByDateRange = async (e) => {
    e.preventDefault();
    
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.warning('Please select date range');
      return;
    }
    
    try {
      setExportLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.post(`${backendUrl}/api/order/export-by-date`, dateRange, {
        responseType: 'blob',
        headers: {
          token: token
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setExportLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <p className="text-gray-500">View and update order status</p>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">Filter Orders by Date Range</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button
            onClick={exportOrdersByDateRange}
            disabled={exportLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2"></div>
                Exporting...
              </>
            ) : (
              <>Export Orders</>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Order Date</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Total Amount</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{order._id.slice(-6)}</td>
                  <td className="py-3 px-4">{formatDate(order.orderDate)}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{order.userId?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{order.userId?.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">${Number(order.totalAmount).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    {statusLoading === order._id ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 rounded-full"></div>
                    ) : (
                      <>
                        <select 
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => exportOrder(order._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Export Order"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
