import LOGINMAPPING from "../models/LOGINMAPPING.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ADMIN from "../models/ADMIN.js";
import ACCOUNT from "../models/ACCOUNT.js";
import OTP from "../models/OTP.js";
import { sendOtopEmail, sendRegistrationEmail } from "../utils/sendMail.js";

//For login user 
export const loginUser = async (req, res, next) =>{
    try{
      const {email, password, userType} = req.body

      if(!email || !password || !userType) return res.status(200).json({message:"Please provide all required fields.",success:false})

      const user = await LOGINMAPPING.findOne({email, userType})

      if(!user) return res.status(404).json({message:"User not found.",success:false})

      if(user.expiry < new Date()) return res.status(403).json({message:"Your plan has been expired. Please contact to admin.",success:false})

      if(!user.status) return res.status(404).json({message:"User is not active.",success:false})

      const isPasswordMatched = await bcryptjs.compare(password,user.password)

      if(!isPasswordMatched) return res.status(401).json({message:"Password is incorrect.",success:false})

      const otp = Math.floor(1000 + Math.random() * 9000).toString(); 

      const sentOtp = await sendOtopEmail(email, otp);

      if(!sentOtp) return res.status(500).json({message:"Error in sending OTP. Please try again.",success:false})

      return res.status(200).json({message:"OTP sent to your email address. Please verify OTP to login.", success:true, data:{email, otp}})
    }catch(err){
      next(err)
    }
}

export const verifyOtp = async (req, res, next) =>{
    try{
      const {email, otp} = req.body 

      if(!email || !otp) return res.status(400).json({message:"Please provide all required fields.",success:false})

      const otpDetails = await OTP.findOne({email, otp})

      if(!otpDetails) return res.status(401).json({message:"Invalid OTP.",success:false})

      if(otpDetails.createdAt < new Date(Date.now() - 3 * 60 * 1000)) {
        return res.status(401).json({message:"OTP has expired.",success:false})
      }

      const user = await LOGINMAPPING.findOne({email})

      const token = jwt.sign({mongoid:user.mongoid, userType:user.userType}, process.env.JWT, {expiresIn:'7d'})

      res.cookie('pgtoken', token, {
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
        domain:
         process.env.NODE_ENV === "production" ? ".digitallaundry.co.in" : undefined,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return res.status(200).json({message:'Login Successfully',data:{token,userId:user.mongoid,userType:user.userType,pgcode:user.pgcode}, success:true})

    }catch(err){
      next(err)
    }
}

export const validateToken = async (req, res, next) =>{
     try{
       const token = req.cookies.pgtoken

       if(!token) return res.status(401).json({message:"No Token Found.",success:false})

       const decoded = jwt.verify(token, process.env.JWT)

       const user = await LOGINMAPPING.findOne({mongoid:decoded.mongoid})

       if(!user) return res.status(404).json({message:"User not found.",success:false})

       if(!user.status) return res.status(400).json({message:"User is not active.",success:false})

       return res.status(200).json({message:"Token validate successfully.",data:{token, userId:user.mongoid, userType:user.userType},success:true})

     }catch(err){
        next(err)
     }
}

export const signupUser = async (req, res, next) =>{
    try{
        const {full_name, email, password , userType, contact_no, pgname,address} = req.body

        if(!full_name || !email || !password || !userType) return res.status(400).json({message:"Please provide all required fields."})

        const existUser = await LOGINMAPPING.findOne({email})

        if(existUser) return res.status(409).json({message:"Email address is already exist.",success:false})

        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        let newUser = null
        if(userType === 'Admin'){
            newUser = new ADMIN({
                email,
                full_name,
                pgname,
                address
            })
        }else if(userType === 'Account'){
            newUser = new ACCOUNT({
                full_name,
                contact_no,
                email
            })
        }else{
            return res.status(400).json({message:"Please provide valid user type.",success:false})
        }

        await newUser.save()

        const pgcode = `PG${newUser._id.toString().slice(-6).toUpperCase()}`

        const newLogin = new LOGINMAPPING({
            mongoid:newUser._id,
            email,
            password:hashedPassword,
            userType,
            pgcode,
        })
        
        await newLogin.save()
        
        const DASHBOARD_URL = process.env.NODE_ENV === "production" ? "" : "";
        
        const hasSentEmail = await sendRegistrationEmail(email, pgcode, DASHBOARD_URL);
        
        if(!hasSentEmail) {
          return res.status(500).json({message:"Error in sending registration email. Please try again.",success:false})
        }
        

        return res.status(200).json({message:`New user created successfully. A Dashboard Link and Pgcode has been sent to your email.`,success:true,data:newUser})


    }catch(err){
        next(err)
    }
} 


export const logoutPortal = async (req, res, next) =>{
    try {
      res.clearCookie("pgtoken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.NODE_ENV === "production" ? ".digitallaundry.co.in" : undefined,
      });
  
      return res.status(200).json({ message: "Logout successful", status: 200 });
    } catch (err) {
      next(err);
    }
  }
  