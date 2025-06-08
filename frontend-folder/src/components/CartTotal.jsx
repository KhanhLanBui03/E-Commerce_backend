import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
    const { currency, delivery_fee, getCartAmount, products } = useContext(ShopContext);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();
    
    const calculateTotal = async () => {
        try {
            const amount = await getCartAmount();
            console.log("Tổng tiền:", amount);
            setSubtotal(amount);
            setTotal(amount + delivery_fee);
        } catch (error) {
            console.error("Lỗi khi tính tổng tiền:", error);
        }
    };

    useEffect(() => {
        calculateTotal();
    }, [products]);

    return (
        <div className='bg-white p-6 rounded shadow'>
            <Title>Cart Total</Title>
            <div className='flex flex-col gap-4 mt-4'>
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>{currency}{subtotal}.00</p>
                </div>
                <div className='flex justify-between'>
                    <p>Delivery Fee</p>
                    <p>{currency}{delivery_fee}.00</p>
                </div>
                <hr className='my-2' />
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{currency}{total}.00</b>
                </div>
                <button
                    onClick={() => navigate('/place-order')}
                    className='bg-black text-white py-3 w-full mt-4'
                >
                    PROCEED TO CHECKOUT
                </button>
            </div>
        </div>
    )
}

export default CartTotal; 