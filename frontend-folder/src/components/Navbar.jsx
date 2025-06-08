import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "./../assets/assets";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status when component mounts and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    
    // Initial check
    checkAuth();
    
    // Add event listener for storage changes (for multi-tab functionality)
    window.addEventListener('storage', checkAuth);
    
    // Add event listener for custom auth event
    window.addEventListener('authChange', checkAuth);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  // Handle user icon click
  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  }

  // Handle search icon click
  const handleSearchClick = () => {
    setShowSearch(true);
  }

  // Kiểm tra xem có đang ở trang collection không
  const isCollectionPage = location.pathname === '/collection';

  return (
    <div className="flex items-center justify-between py-5 font-medium bg-white relative z-50">
      <Link to='/' className="transform transition-transform duration-300 hover:scale-105">
        <img src={assets.logo} className="w-36" alt="" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1 group">
          <p className="transition-colors duration-300 group-hover:text-black">HOME</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></hr>
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1 group">
          <p className="transition-colors duration-300 group-hover:text-black">COLLECTION</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></hr>
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1 group">
          <p className="transition-colors duration-300 group-hover:text-black">ABOUT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></hr>
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1 group">
          <p className="transition-colors duration-300 group-hover:text-black">CONTACT</p>
          <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></hr>
        </NavLink>
      </ul>
      <div className="flex items-center gap-6">
        {isCollectionPage && (
          <button 
            onClick={handleSearchClick} 
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-md"
          >
            <img src={assets.search_icon} className="w-5" alt="search"/>
          </button>
        )}
        <div className="group relative">
          <img 
            src={assets.profile_icon} 
            onClick={handleUserClick} 
            className="w-5 cursor-pointer transition-transform duration-300 hover:scale-110"
          />
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 animate-fadeIn">
            <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="cursor-pointer hover:text-black transition-colors duration-300">My Account</Link>
                  <Link to="/orders" className="cursor-pointer hover:text-black transition-colors duration-300">Orders</Link>
                  <p onClick={handleLogout} className="cursor-pointer hover:text-black transition-colors duration-300">Logout</p>
                </>
              ) : (
                <Link to="/login" className="cursor-pointer hover:text-black transition-colors duration-300">Login</Link>
              )}
            </div>
          </div>
        </div>

        <Link to="/cart" className="relative group">
          <img 
            src={assets.cart_icon} 
            className="w-5 min-w-5 transition-transform duration-300 group-hover:scale-110"
          />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px] transform transition-transform duration-300 group-hover:scale-110">
            {getCartCount()}
          </p>
        </Link>
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Sidebar menu for small screens */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform ${
          visible ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="flex flex-col h-full">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-2 p-4 border-b"
          >
            <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="back"/>
            <p className="text-gray-600">Back</p>
          </div>
          <div className="flex flex-col">
            <NavLink 
              onClick={() => setVisible(false)} 
              className={({isActive}) => 
                `py-3 px-6 border-b transition-colors duration-300 ${
                  isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
              to="/"
            >
              HOME
            </NavLink>
            <NavLink 
              onClick={() => setVisible(false)} 
              className={({isActive}) => 
                `py-3 px-6 border-b transition-colors duration-300 ${
                  isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink 
              onClick={() => setVisible(false)} 
              className={({isActive}) => 
                `py-3 px-6 border-b transition-colors duration-300 ${
                  isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink 
              onClick={() => setVisible(false)} 
              className={({isActive}) => 
                `py-3 px-6 border-b transition-colors duration-300 ${
                  isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
              to="/contact"
            >
              CONTACT
            </NavLink>
          </div>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {visible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setVisible(false)}
        />
      )}
    </div>
  );
};

export default Navbar;
