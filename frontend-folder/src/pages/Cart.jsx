import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import Title from '../components/Title';
import { ShopContext } from '../context/ShopContext';

const Cart = () => {
  const{products,currency,cartItems,updateQuantity,navigate} = useContext(ShopContext);
  const[cartData,setCartData] = useState([]);
  const[isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("CartItems:", cartItems);
    console.log("Products:", products);
    
    // If no cart, no need to process
    if (!cartItems || Object.keys(cartItems).length === 0) {
      console.log("Cart is empty");
      setCartData([]);
      setIsLoading(false);
      return;
    }
    
    const tempData = [];
    for(const itemId in cartItems){
      const item = cartItems[itemId];
      if (item && item.sizes) {
        for(const size in item.sizes){
          if(item.sizes[size] > 0){
            tempData.push({
              _id: itemId,
              size: size,
              quantity: item.sizes[size],
              product: item.product
            });
          }
        }
      }
    }
    
    console.log("Cart data prepared:", tempData);
    setCartData(tempData);
    setIsLoading(false);
  },[cartItems, products]);
  
  const handleRemoveItem = (itemId, size) => {
    updateQuantity(itemId, size, 0);
    toast.success('Product removed');
  }
  
  // Function to clear entire cart
  const clearCart = () => {
    localStorage.removeItem('cartItems');
    setCartData([]);
    window.location.reload();
  }
  
  if (isLoading) {
    return (
      <div className='border-t pt-14 text-center'>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3 flex justify-between items-center'>
        <Title text1={'Shopping'} text2={'Cart'}/>
        {cartData.length > 0 && (
          <button 
            onClick={clearCart} 
            className='text-sm text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50'
          >
            Clear All
          </button>
        )}
      </div>
      <div>
        {cartData.length > 0 ? (
          cartData.map((item, index) => {
            const productData = item.product;
            
            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  {productData?.image?.length > 0 ? (
                    <img src={productData.image[0]} alt={productData.name} className='w-16 sm:w-20'/>
                  ) : (
                    <div className='w-16 sm:w-20 h-20 bg-gray-200 flex items-center justify-center'>
                      <span className='text-xs text-gray-500'>No image</span>
                    </div>
                  )}
                  <div>
                    <p className='font-medium text-xs sm:text-lg'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p>{currency}{productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                    </div>
                  </div>
                </div>
                <input 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '' && value !== '0') {
                      updateQuantity(item._id, item.size, Number(value));
                    }
                  }} 
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1" 
                  type="number" 
                  min={1} 
                  defaultValue={item.quantity}
                />
                <img 
                  onClick={() => handleRemoveItem(item._id, item.size)} 
                  className='w-4 mr-4 sm:w-5 cursor-pointer' 
                  src={assets.bin_icon} 
                  alt="Remove" 
                />
              </div>
            );
          })
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-500'>Cart is empty</p>
            <button onClick={() => navigate('/')} className='mt-4 bg-black text-white px-4 py-2'>Continue Shopping</button>
          </div>
        )}
      </div>
      {cartData.length > 0 && (
        <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[450px]'>
            <CartTotal/>
            <div className='w-full text-end'>
              <button onClick={() => navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>Place Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
