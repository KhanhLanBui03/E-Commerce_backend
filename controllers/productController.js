import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';
import mongoose from "mongoose";
//funcion for add product
const addProduct = async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận từ frontend:", req.body);
        console.log("📷 Danh sách ảnh nhận được:", req.files);

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc!" });
        }

        let images = [];
        if (req.files) {
            for (const key in req.files) {
                const file = req.files[key][0];
                const result = await cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) {
                        console.error("❌ Lỗi upload Cloudinary:", error);
                    } else {
                        images.push(result.secure_url);
                    }
                });
                result.end(file.buffer); // ✅ Upload file từ RAM thay vì ổ đĩa
            }
        }

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true",
            image: images,
            date: Date.now()
        };

        const newProduct = new productModel(productData);
        await newProduct.save();

        res.json({ success: true, message: "Sản phẩm đã được thêm thành công!", product: newProduct });
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//function for add product from JSON (không cần upload hình ảnh qua multer)
export const addProductJSON = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            date: Date.now() // Cập nhật thời gian hiện tại
        };
        
        const newProduct = new productModel(productData);
        await newProduct.save();
        
        res.json({success: true, message: "Sản phẩm đã được thêm thành công!", product: newProduct});
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.json({success: false, message: error.message});
    }
};

//function for get all products
const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({success: true, products});
    } catch (error) {
        console.error("Error in listProduct:", error);
        res.json({ success: false, message: error.message});
    }
}
//function for removing product 
const removeProduct = async (req, res) => {
    try {
        const { _id } = req.body;

        
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }

        
        const product = await productModel.findByIdAndDelete(new mongoose.Types.ObjectId(_id));

        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        res.json({ success: true, message: "Sản phẩm đã bị xóa" });
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//function for get single product 
const singleProduct = async (req, res) => {
    try {
        const { id } = req.query;
        const product = await productModel.findById(id);
        res.json({success: true, product});
    } catch (error) {
        console.error("Error in singleProduct:", error);
        res.json({ success: false, message: error.message});
    }
}

export { addProduct, listProduct, removeProduct, singleProduct };


