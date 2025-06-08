import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import productModel from '../models/productModel.js';
//funcion for add product
export const addProduct = async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận từ frontend:", req.body);
        console.log("📷 Danh sách ảnh nhận được:", req.files);

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc!" });
        }

        const priceValue = Number(price);
        if (isNaN(priceValue) || priceValue <= 0) {
            return res.status(400).json({ success: false, message: "Giá sản phẩm không hợp lệ!" });
        }

        let images = [];
        if (req.files) {
            const uploadPromises = Object.keys(req.files).map(async (key) => {
                const file = req.files[key][0];

                // Kiểm tra file trước khi upload
                if (!file.buffer || file.buffer.length === 0) {
                    throw new Error(`File ${file.fieldname} rỗng!`);
                }

                const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error(`File ${file.fieldname} phải là hình ảnh (PNG, JPEG, JPG)!`);
                }

                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: "image" },
                        (error, result) => {
                            if (error) {
                                console.error("❌ Lỗi upload Cloudinary:", error);
                                reject(new Error("Lỗi upload Cloudinary: " + error.message));
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    );
                    stream.end(file.buffer);
                });
            });

            try {
                images = await Promise.all(uploadPromises);
            } catch (uploadError) {
                return res.status(400).json({ success: false, message: uploadError.message });
            }
        }

        let parsedSizes = [];
        if (typeof sizes === "string") {
            try {
                parsedSizes = JSON.parse(sizes);
                if (!Array.isArray(parsedSizes)) {
                    throw new Error("Sizes phải là một mảng!");
                }
            } catch (error) {
                console.error("❌ Lỗi parse sizes:", error.message);
                return res.status(400).json({ success: false, message: "Dữ liệu sizes không hợp lệ: " + error.message });
            }
        } else if (Array.isArray(sizes)) {
            parsedSizes = sizes;
        } else {
            return res.status(400).json({ success: false, message: "Sizes phải là một mảng hoặc chuỗi JSON hợp lệ!" });
        }

        const productData = {
            name,
            description,
            price: priceValue,
            category,
            subCategory,
            sizes: parsedSizes,
            bestseller: bestseller === "true",
            image: images.length > 0 ? images : (req.body.image || []),
            date: new Date(req.body.date || Date.now())
        };

        console.log("📦 Dữ liệu trước khi lưu:", productData);

        const newProduct = new productModel(productData);
        try {
            await newProduct.validate();
        } catch (validationError) {
            console.error("❌ Lỗi validation:", validationError);
            return res.status(400).json({ success: false, message: "Lỗi validation: " + validationError.message });
        }

        await newProduct.save();
        console.log("✅ Sản phẩm sau khi lưu:", newProduct);

        res.json({ success: true, message: "Sản phẩm đã được thêm thành công!", product: newProduct });
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
//function for add product from JSON (không cần upload hình ảnh qua multer)
export const addProductJSON = async (req, res) => {
    try {
        console.log("📥 Dữ liệu nhận từ frontend:", req.body); // 🚀 Kiểm tra dữ liệu nhận được

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        if (!name || !description || !price || !category || !subCategory) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin sản phẩm!" });
        }

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes || "[]"),
            bestseller: bestseller === "true",
            date: Date.now()
        };

        console.log("📦 Dữ liệu chuẩn bị lưu:", productData);

        const newProduct = new productModel(productData);
        await newProduct.save();

        res.json({ success: true, message: "Sản phẩm đã được thêm thành công!", product: newProduct });

    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

//function for get all products
export const listProduct = async (req, res) => {
    try {
        console.log("📍 Request Query Parameters:", req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || "";
        const category = req.query.category ? req.query.category.split(',') : [];
        const subCategory = req.query.subCategory ? req.query.subCategory.split(',') : [];
        const sortType = req.query.sortType || "relevant";

        // Xây dựng query
        let query = {};
        
        // Thêm điều kiện tìm kiếm
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Thêm điều kiện lọc category
        if (category.length > 0) {
            query.category = { $in: category };
        }
        
        // Thêm điều kiện lọc subCategory
        if (subCategory.length > 0) {
            query.subCategory = { $in: subCategory };
        }

        // Tính toán số lượng bỏ qua
        const skip = (page - 1) * limit;

        // Xây dựng sort options
        let sortOptions = {};
        switch (sortType) {
            case "low-high":
                sortOptions = { price: 1 };
                break;
            case "high-low":
                sortOptions = { price: -1 };
                break;
            default:
                sortOptions = { date: -1 }; // Mặc định sắp xếp theo ngày tạo mới nhất
        }

        // Lấy limit + 1 sản phẩm để kiểm tra xem còn trang tiếp theo không
        const products = await productModel
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit + 1);

        // Kiểm tra xem có sản phẩm ở trang tiếp theo không
        const hasNextPage = products.length > limit;
        
        // Chỉ trả về đúng số lượng limit sản phẩm
        const responseProducts = products.slice(0, limit);

        res.json({
            success: true,
            products: responseProducts,
            currentPage: page,
            hasNextPage
        });
    } catch (error) {
        console.error("❌ Error in listProduct:", error);
        res.json({ success: false, message: error.message });
    }
};
//function for removing product 
export const removeProduct = async (req, res) => {
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
export const singleProduct = async (req, res) => {
    try {
        const { id } = req.query;
        const product = await productModel.findById(id);
        res.json({success: true, product});
    } catch (error) {
        console.error("Error in singleProduct:", error);
        res.json({ success: false, message: error.message});
    }
}


