import express from 'express';
import { adminLogin, getAdminStats, loginUser, registerUser } from '../controllers/userController.js';

const userRoute = express.Router();

userRoute.post('/register',registerUser);
userRoute.post('/login',loginUser);
userRoute.post('/admin',adminLogin);
userRoute.get('/admin/stats', getAdminStats);

export default userRoute;