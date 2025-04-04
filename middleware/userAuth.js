import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const userAuth = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization hoặc header token
        let token = req.headers.authorization || req.headers.token;
        
        if (!token) {
            return res.json({ success: false, message: "Không tìm thấy token, vui lòng đăng nhập" });
        }

        // Xử lý token nếu ở định dạng "Bearer token"
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        
        // Check if user exists in the database
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }
        
        // Add userId to request for use in route handlers
        req.userId = userId;
        
        next();
    } catch (error) {
        console.error("Lỗi xác thực người dùng:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.json({ success: false, message: "Token không hợp lệ" });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Token đã hết hạn, vui lòng đăng nhập lại" });
        }
        
        res.json({ success: false, message: error.message });
    }
};

export default userAuth; 