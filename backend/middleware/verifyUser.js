import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()


export const verifyToken = async (req, res, next) =>{
    const token = req.cookies.pgtoken

    if(!token) return res.status(401).json({message:'Access denied. No token provided.',success:false})

    try{

        const decoded = jwt.verify(token, process.env.JWT)
 
        req.mongoid = decoded.mongoid
        req.userType = decoded.userType
        req.pgcode = decoded.pgcode;
        next()

    }catch(err){
        return res.status(400).json({message:"Invalid token.",success:false})
    }
} 

export const verifyAdmin = async (req, res, next) =>{
    const userType = req.userType

    if(userType && userType==='Admin'){
        next()
    }else{
        return res.status(400).json({message:"Invalid user type",success:false})
    }
}