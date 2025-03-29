import express from 'express';
import { adminLogin, getUserProfile, loginUser, registerUser, updateUserProfile } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';

const userRoute = express.Router();

userRoute.post('/register', registerUser);
userRoute.post('/login', loginUser);
userRoute.post('/admin', adminLogin);

// Protected routes
userRoute.get('/profile', userAuth, getUserProfile);
userRoute.put('/profile', userAuth, updateUserProfile);

export default userRoute;