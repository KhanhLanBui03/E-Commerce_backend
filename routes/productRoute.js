import express from 'express';
import { addProduct, addProductJSON, listProduct, removeProduct, singleProduct } from '../controllers/productController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';
import productModel from '../models/productModel.js';


const productRoute = express.Router();

productRoute.post(
    "/add", adminAuth, 
    upload.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 }
    ]),
    addProduct
);
productRoute.get('/list', listProduct);
productRoute.post('/remove', removeProduct);
productRoute.post('/single', singleProduct);
productRoute.post('/add-json', addProductJSON);
productRoute.post('/bulk-import', adminAuth, async (req, res) => {
    try {
        const { products } = req.body;
        
        if (!Array.isArray(products)) {
            return res.json({ success: false, message: "Dữ liệu không hợp lệ, cần là một mảng các sản phẩm" });
        }
        
        const results = {
            total: products.length,
            success: 0,
            failed: 0,
            errors: []
        };
        
        for (const product of products) {
            try {
                const productData = {
                    ...product,
                    date: Date.now() // Cập nhật thời gian hiện tại
                };
                
                const newProduct = new productModel(productData);
                await newProduct.save();
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    product: product.name,
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true, 
            message: `Đã import ${results.success}/${results.total} sản phẩm thành công`,
            results
        });
    } catch (error) {
        console.error("Lỗi khi import sản phẩm hàng loạt:", error);
        res.json({ success: false, message: error.message });
    }
});

export default productRoute;