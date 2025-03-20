
import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';
//funcion for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Kiểm tra req.files trước khi truy cập
        const image1 =req.files.image1 && req.files?.image1?.[0]
        const image2 =req.files.image2 && req.files?.image2?.[0]
        const image3 =req.files.image3 && req.files?.image3?.[0]
        const image4 =req.files.image4 && req.files?.image4?.[0]
        const images = [image1, image2, image3, image4].filter((item)=>item !== undefined);
        let imageUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path,{resource_type: "image"});
                return result.secure_url;
            })
        )
        const productData ={
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true"? true : false,
            date: Date.now(),
            image: imageUrl
        }
        console.log(productData);
        const product = new productModel(productData);
        await product.save();

        res.json({success: true, message: "Product added successfully"});

    } catch (error) {
        console.error("Error in addProduct:", error);
        res.json({ success: false, message: error.message});
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
        await productModel.findByIdAndDelete(req.body.id);
        res.json({success: true, message: "Product removed successfully"});
    } catch (error) {
        console.error("Error in removeProduct:", error);
        res.json({ success: false, message: error.message});
    }
}

//function for single product info
const singleProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await productModel.findById(id);
        res.json({success: true, product});
    } catch (error) {
        console.error("Error in singleProduct:", error);
        res.json({ success: false, message: error.message});
    }
}

export { addProduct, listProduct, removeProduct, singleProduct };


