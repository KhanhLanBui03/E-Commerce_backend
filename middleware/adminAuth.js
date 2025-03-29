import jwt from 'jsonwebtoken';

const adminAuth = async (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.json({success:false,message:"Token required"});
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.role !== 'admin'){
            return res.json({success:false,message:"Not Authorized Login Again"});
        }
        
        next();
    }catch(error){
        console.error("Error in adminAuth:",error);
        res.json({success:false,message:error.message});
    }
}

export default adminAuth;