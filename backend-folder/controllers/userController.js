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
            // Tạo token với một ID duy nhất cho admin
            const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
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

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.json({ success: false, message: "An error occurred while fetching profile" });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, phone, address } = req.body;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.json({ success: false, message: "Email is already taken" });
            }
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name, email, phone, address },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.json({ success: false, message: "An error occurred while updating profile" });
    }
};

export { adminLogin, getAdminStats, getUserProfile, loginUser, registerUser, updateUserProfile };

