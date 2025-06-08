import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem';
import Title from './Title';

const RelatedProducts = ({category, subCategory}) => {
    const {products} = useContext(ShopContext);
    const [related, setRelated] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!category || !subCategory) {
            console.log("Thiếu thông tin danh mục");
            return;
        }
        
        if (!products || products.length === 0) {
            console.log("Chưa có dữ liệu sản phẩm");
            return;
        }

        try {
            console.log("Tìm sản phẩm liên quan cho:", category, subCategory);
            
            // Lọc sản phẩm cùng danh mục và danh mục con
            let relatedProducts = products.filter(
                item => item.category === category && item.subCategory === subCategory
            );
            
            console.log("Sản phẩm liên quan:", relatedProducts);
            
            // Lấy tối đa 4 sản phẩm
            setRelated(relatedProducts.slice(0, 4));
        } catch (error) {
            console.error("Lỗi khi lọc sản phẩm liên quan:", error);
        }
    }, [products, category, subCategory]);

    if (related.length === 0) {
        return null; // Không hiển thị phần này nếu không có sản phẩm liên quan
    }

    return (
        <div className='my-24'>
            <div className='text-center text-2xl py-2'>
                <Title text1={'Related'} text2={"Products"}/>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
                {related.map((item, index) => (
                    <ProductItem 
                        key={index}
                        data={item}
                    />
                ))}
            </div>
        </div>
    )
}

export default RelatedProducts; 