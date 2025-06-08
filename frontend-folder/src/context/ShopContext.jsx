import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/+$/, "");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const navigate = useNavigate();

  const getProductsData = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category?.length) queryParams.append('category', params.category.join(','));
      if (params.subCategory?.length) queryParams.append('subCategory', params.subCategory.join(','));
      if (params.sortType) queryParams.append('sortType', params.sortType);

      const apiUrl = `${backendUrl}/api/products/list?${queryParams.toString()}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
        setHasNextPage(response.data.hasNextPage);
        console.log(`📦 Loaded ${response.data.products.length} products for page ${response.data.currentPage}`);
        console.log(`📊 Total pages: ${response.data.totalPages}, Total products: ${response.data.totalProducts}`);
      } else {
        console.error("❌ API Error:", response.data.message);
        setError(response.data.message);
      }
    } catch (error) {
      console.error("❌ Request Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to get real product ID from database when creating order
  const getRealProductId = async (productName) => {
    try {
      const response = await axios.get(`${backendUrl}/api/products/name/${productName}`);
      if (response.data.success && response.data.product) {
        return response.data.product._id;
      }
      throw new Error("Product not found");
    } catch (error) {
      console.error("Error getting product ID:", error);
      throw error;
    }
  }

  // useEffect để load sản phẩm và giỏ hàng ban đầu
  useEffect(() => {
    getProductsData({
      page: 1,
      limit: 12
    });
  }, []); // Chỉ chạy 1 lần khi component mount

  // useEffect riêng để xử lý giỏ hàng khi products thay đổi
  useEffect(() => {
    if (products.length > 0) {
      // Tải giỏ hàng từ localStorage nếu có
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          
          // Chuyển đổi định dạng cũ sang định dạng mới
          const convertedCart = {};
          for (const [itemId, itemData] of Object.entries(parsedCart)) {
            // Kiểm tra xem itemData có phải là object với thuộc tính sizes không
            if (itemData && typeof itemData === 'object' && 'sizes' in itemData) {
              // Đã ở định dạng mới
              const product = products.find(p => p._id === itemId);
              if (product) {
                convertedCart[itemId] = {
                  ...itemData,
                  product: product // Cập nhật thông tin sản phẩm mới nhất
                };
              }
            } else {
              // Định dạng cũ
              const product = products.find(p => p._id === itemId);
              if (product) {
                convertedCart[itemId] = {
                  product: product,
                  sizes: {}
                };
                // Chuyển đổi size và số lượng
                for (const [size, quantity] of Object.entries(itemData)) {
                  if (quantity > 0) {
                    convertedCart[itemId].sizes[size] = quantity;
                  }
                }
              }
            }
          }
          
          // Chỉ cập nhật cartItems nếu có sự thay đổi
          const currentCartJSON = JSON.stringify(cartItems);
          const newCartJSON = JSON.stringify(convertedCart);
          if (currentCartJSON !== newCartJSON) {
            console.log("Giỏ hàng sau khi chuyển đổi:", convertedCart);
            setCartItems(convertedCart);
          }
        } catch (error) {
          console.error("Lỗi khi tải giỏ hàng:", error);
          // Xóa dữ liệu giỏ hàng không hợp lệ
          localStorage.removeItem('cartItems');
          setCartItems({});
        }
      }
    }
  }, [products]); // Chỉ chạy khi products thay đổi

  // useEffect để lưu giỏ hàng vào localStorage
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      console.log("Đã lưu giỏ hàng vào localStorage:", cartItems);
    } else {
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  const addToCart = async(itemId, size) => {
    if(!itemId) {
      console.error("Invalid product ID:", itemId);
      toast.error('Invalid product ID');
      return;
    }
    
    if(!size){
      toast.error('Please select a size');
      return;
    }
    
    try {
      // Try to find product in current state
      let product = products.find(p => p._id === itemId);
      
      // If not found in state, call API to get product info
      if (!product) {
        console.log("Product not found in state, calling API...");
        const response = await axios.get(`${backendUrl}/api/products/${itemId}`);
        if (response.data.success && response.data.product) {
          product = response.data.product;
        } else {
          throw new Error("Product not found");
        }
      }
      
      console.log("Product found to add to cart:", product);
      
      let cartData = structuredClone(cartItems);
      const cartItemKey = itemId;
      
      if (!cartData[cartItemKey]) {
        cartData[cartItemKey] = {
          product: product,
          sizes: {}
        };
      }
      
      if (!cartData[cartItemKey].sizes[size]) {
        cartData[cartItemKey].sizes[size] = 0;
      }
      
      cartData[cartItemKey].sizes[size] += 1;
      
      console.log("Adding to cart:", cartItemKey, size, cartData);
      setCartItems(cartData);
      toast.success('Added to cart');
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error('Could not add product to cart');
    }
  }

  const getCartCount = () => {
    let totalCount = 0;
    try {
      for(const itemKey in cartItems){
        const item = cartItems[itemKey];
        if (item && item.sizes) {
          for(const size in item.sizes){
            if(item.sizes[size] > 0){
              totalCount += item.sizes[size];
            }
          }
        }
      }
    } catch(error) {
      console.error('Lỗi khi tính số lượng giỏ hàng:', error);
    }
    return totalCount;
  }

  const updateQuantity = async(itemId, size, quantity) => {
    try {
      let cartData = structuredClone(cartItems);
      
      // Check if item exists
      if (!cartData[itemId]) {
        const product = products.find(p => p._id === itemId);
        if (!product) {
          throw new Error("Product not found");
        }
        cartData[itemId] = {
          product: product,
          sizes: {}
        };
      }
      
      // Check and update sizes
      if (!cartData[itemId].sizes) {
        cartData[itemId].sizes = {};
      }
      
      cartData[itemId].sizes[size] = quantity;
      setCartItems(cartData);
      
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Could not update product quantity");
    }
  }

  const getCartAmount = async() => {
    let totalAmount = 0;
    try {
      for(const itemKey in cartItems){
        const item = cartItems[itemKey];
        if (item && item.product && item.sizes) {
          for(const size in item.sizes){
            if (item.sizes[size] > 0) {
              totalAmount += item.product.price * item.sizes[size];
            }
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi tính tổng tiền:', error);
    }
    return totalAmount;
  }

  const contextValue = {
    products,
    currency,
    delivery_fee,
    search, 
    setSearch,
    showSearch,
    setShowSearch, 
    backendUrl,
    loading,
    error,
    totalPages,
    totalProducts,
    hasNextPage,
    getProductsData,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    getRealProductId,
    navigate
  };
  
  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
