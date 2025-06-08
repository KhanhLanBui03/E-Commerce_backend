import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { FaEdit, FaEnvelope, FaMapMarkerAlt, FaPhone, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const Profile = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }

    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserInfo(response.data.user);
      } else {
        toast.error(response.data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error('An error occurred while loading profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${backendUrl}/api/user/profile`, userInfo, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchUserProfile(); // Refresh profile data
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error('An error occurred while updating profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-8 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 md:flex-row flex-col text-center gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <FaUser className="text-4xl text-gray-700" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 m-0">Profile</h1>
        <button 
          onClick={handleEdit}
          className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-700 transition-colors"
        >
          <FaEdit /> {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="py-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg md:flex-row flex-col items-start gap-2">
            <div className="text-2xl text-gray-700">
              <FaUser />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-700"
                />
              ) : (
                <p className="m-0 text-gray-800">{userInfo.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg md:flex-row flex-col items-start gap-2">
            <div className="text-2xl text-gray-700">
              <FaEnvelope />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-700"
                />
              ) : (
                <p className="m-0 text-gray-800">{userInfo.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg md:flex-row flex-col items-start gap-2">
            <div className="text-2xl text-gray-700">
              <FaPhone />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-700"
                />
              ) : (
                <p className="m-0 text-gray-800">{userInfo.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg md:flex-row flex-col items-start gap-2">
            <div className="text-2xl text-gray-700">
              <FaMapMarkerAlt />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userInfo.address}
                  onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-700"
                />
              ) : (
                <p className="m-0 text-gray-800">{userInfo.address || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <button 
            onClick={handleSave}
            className="bg-gray-800 text-white px-8 py-3 rounded-md mt-4 hover:bg-gray-700 transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
