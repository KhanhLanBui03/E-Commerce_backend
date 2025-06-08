import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { ShopContext } from '../context/ShopContext';

const Product = () => {
  const {productId} = useParams();
  
  console.log('Product details params:', productId);
  
  const {products, currency, addToCart, loading} = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  // Add console.log for debugging routing
  console.log('Current URL:', window.location.pathname);
  console.log('ProductID:', productId);

  const findProduct = () => {
    // Find product by ID using only real product list
    const foundProduct = products.find((item) => item._id === productId );
      
    setProductData(foundProduct);
    
    if(foundProduct && foundProduct.image) {
      setImage(foundProduct.image[0]);
    }
  }

  useEffect(() => {
    findProduct();
  }, [productId, products]);

  // New useEffect to scroll to top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [productId]);

  const handleAddToCart = () => {
    if (!size) {
      toast.error('Please select a size');
      return;
    }
    console.log("Adding product to cart with ID:", productData._id, "Size:", size, "ProductData:", productData);
    
    if (!productData._id) {
      toast.error('Invalid product ID');
      return;
    }
    
    addToCart(productData._id, size);
  }

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p>Can not find any product. <button onClick={() => window.history.back()} className='text-blue-500 underline'>Go Back</button></p>
      </div>
    );
  }

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image && productData.image.map((item,index) => (
              <img 
                src={item} 
                key={index}  
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' 
                onClick={() => setImage(item)} 
                alt={`${productData.name} - view ${index+1}`}
              />
            ))}
          </div>
          <div className='sm:w-[80%] w-full'>
            <img src={image} className='w-full h-auto object-cover' alt={productData.name} />
          </div>
        </div>
        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='text-2xl font-medium mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="rating" className="w-3.5" />
            <img src={assets.star_icon} alt="rating" className="w-3.5" />
            <img src={assets.star_icon} alt="rating" className="w-3.5" />
            <img src={assets.star_icon} alt="rating" className="w-3.5" />
            <img src={assets.star_dull_icon} alt="rating" className="w-3.5" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 md:w-4/5 text-gray-500'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Choose size</p>
            <div className='flex gap-2'>
              {productData.sizes && productData.sizes.map((item,index) => (
                <button 
                  onClick={() => setSize(item)}  
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} 
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleAddToCart} 
            className='bg-black text-white py-3 px-8 text-sm active:bg-gray-700'
          >
            Add to cart
          </button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='flex flex-col gap-1 mt-5 text-sm text-gray-500'>
            <p>100% Authentic Products</p>
            <p>Pay on Delivery Available</p>
            <p>Easy 7-day Returns</p>
          </div>
        </div>
      </div>
      {/* Description and Reviews */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>{productData.description}</p>
        </div>
      </div>
      {productData.category && productData.subCategory && (
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      )}
    </div>
  );
}

export default Product;
