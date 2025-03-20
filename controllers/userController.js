import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


//Route for user logon
const loginUser = async (req,res) =>{
    try {
        const {email,password} = req.body;
        // checking user exists or not
        const user = await userModel.findOne({email:email});
        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(isMatch){
            const token = createToken(user._id);
            return res.json({success:true,token});
        }
        if(!isMatch){
            return res.json({success:false,message:"Invalid credentials"});
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"An error occurred while logging in."});
        
    }
}

//Route for user register
const registerUser = async (req,res)=>{
    try{
        const {name,email,password} = req.body;
        
        // checking user already exists or not
        const userExists = await userModel.findOne({email:email});
        if(userExists){
            return res.json({success:false,message:"User already exists"});
        }
        //validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"});
        }
        if(password.length<8){
            return res.json({success:false,message:"Password must be atleast 8 characters"});
        }
        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success:true,token});
    }catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for admin login
const adminLogin = async (req,res) =>{
    try {
        const {email,password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            if (!process.env.JWT_SECRET) {
                return res.json({success:false,message:"Server configuration error."});
            }
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({success:true,token}); 
        }else {
            res.json({success:false,message:"Invalid credentials"});
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"An error occurred during admin login."});
        
    }
};

// Route for getting admin stats
const getAdminStats = async (req, res) => {
    try {
        // Logic to fetch stats
        const stats = {
            totalProducts: 100, // Example data
            totalOrders: 200,  // Example data
            totalRevenue: 50000, // Example data
            pendingOrders: 10  // Example data
        };
        res.json({ success: true, stats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "An error occurred while fetching stats." });
    }
};

export { adminLogin, getAdminStats, loginUser, registerUser };

