import { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { ProductItem, Title } from "../components";
import ScrollAnimation from "../components/ScrollAnimation";
import { ShopContext } from "./../context/ShopContext";

const Collection = () => {
  const { products, search, showSearch, loading, error, hasNextPage, getProductsData } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  // Fetch products khi các filter thay đổi
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingMore(true);
      try {
        await getProductsData({
          page: currentPage,
          limit: 12,
          search: showSearch ? search : '',
          category,
          subCategory,
          sortType
        });
      } finally {
        setIsLoadingMore(false);
      }
    };
    
    fetchProducts();
  }, [currentPage, category, subCategory, search, showSearch, sortType]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [category, subCategory, search, sortType]);

  // Hàm điều hướng trang
  const goToNextPage = () => {
    if (hasNextPage && !isLoadingMore) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1 && !isLoadingMore) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t ${showSearch ? 'mt-[72px]' : ''}`}>
      {/* Filter Options */}
      <ScrollAnimation className="min-w-60">
        <div>
          <p
            onClick={() => setShowFilter(!showFilter)}
            className="my-2 text-xl flex items-center cursor-pointer gap-2"
          >
            FILTER
          </p>
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt="dropdown"
          />
          
          {/* Category Filter */}
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">CATEGORY</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Men"
                  onChange={toggleCategory}
                />
                Men
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Women"
                  onChange={toggleCategory}
                />
                Women
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Kids"
                  onChange={toggleCategory}
                />
                Kids
              </p>
            </div>
          </div>

          {/* SubCategory Filter */}
          <div
            className={`border border-gray-300 pl-5 py-3 my-5 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">PRODUCT TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Topwear"
                  onChange={toggleSubCategory}
                />
                Tops
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Bottomwear"
                  onChange={toggleSubCategory}
                />
                Bottoms
              </p>
              <p className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value="Winterwear"
                  onChange={toggleSubCategory}
                />
                Winter Wear
              </p>
            </div>
          </div>
        </div>
      </ScrollAnimation>

      {/* Right side */}
      <div className="flex-1">
        <ScrollAnimation className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"PRODUCTS"} />

          {/* Product Sort */}
          <select 
            onChange={(e) => setSortType(e.target.value)} 
            className="border-2 border-gray-300 text-sm px-2"
            value={sortType}
            disabled={loading || isLoadingMore}
          >
            <option value="relevant">Sort: Most Relevant</option>
            <option value="low-high">Sort: Price Low to High</option>
            <option value="high-low">Sort: Price High to Low</option>
          </select>
        </ScrollAnimation>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10 text-red-500">
            <p>Error loading products. Please try again later.</p>
            <button 
              onClick={() => getProductsData({
                page: currentPage,
                limit: 12,
                search: showSearch ? search : '',
                category,
                subCategory,
                sortType
              })}
              className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800"
              disabled={isLoadingMore}
            >
              Retry
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((item, index) => (
                <ScrollAnimation key={item._id} delay={index * 0.1}>
                  <ProductItem data={item} />
                </ScrollAnimation>
              ))}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8 mb-6">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1 || isLoadingMore}
                  className={`px-4 py-2 border ${
                    currentPage === 1 || isLoadingMore
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  {isLoadingMore ? 'Loading...' : 'Previous'}
                </button>
                <span className="text-sm">
                  Page {currentPage}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={!hasNextPage || isLoadingMore}
                  className={`px-4 py-2 border ${
                    !hasNextPage || isLoadingMore
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  {isLoadingMore ? 'Loading...' : 'Next'}
                </button>
              </div>
            )}

            {/* No Products Message */}
            {products.length === 0 && (
              <div className="text-center py-10">
                <p>No products found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
