import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'

const Searchbar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext)

    return showSearch ? (
        <div className='w-full bg-white border-t border-b shadow-md'>
            <div className='max-w-4xl mx-auto px-4 py-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 flex items-center border border-gray-300 rounded-full px-4 py-2'>
                        <input 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className='flex-1 outline-none bg-transparent text-sm' 
                            type='text' 
                            placeholder='Tìm kiếm sản phẩm...'
                            autoFocus
                        />
                        <img className='w-4 h-4' src={assets.search_icon} alt="search"/>
                    </div>
                    <button 
                        onClick={() => setShowSearch(false)} 
                        className='ml-4 p-2 hover:bg-gray-100 rounded-full'
                    >
                        <img className='w-5 h-5' src={assets.cross_icon} alt="close"/>
                    </button>
                </div>
            </div>
        </div>
    ) : null
}

export default Searchbar