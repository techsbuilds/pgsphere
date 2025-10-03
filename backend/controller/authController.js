import LOGINMAPPING from "../models/LOGINMAPPING.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ADMIN from "../models/ADMIN.js";
import { removeFile } from "../utils/removeFile.js";
import OTP from "../models/OTP.js";
import { sendOtopEmail, sendRegistrationEmail } from "../utils/sendMail.js";
import CUSTOMER from "../models/CUSTOMER.js";
import ROOM from "../models/ROOM.js";
import BRANCH from "../models/BRANCH.js";
import path from 'path'
import ACCOUNT from "../models/ACCOUNT.js";

//For login user 
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body

    if (!email || !password || !userType) return res.status(200).json({ message: "Please provide all required fields.", success: false })

    const user = await LOGINMAPPING.findOne({ email, userType })

    if (!user) return res.status(404).json({ message: "User not found.", success: false })

    if (user.expiry < new Date()) return res.status(403).json({ message: "Your plan has been expired. Please contact to admin.", success: false })

    if (user.status === 'inactive') return res.status(400).json({ message: "Your account is not active. Please contact to admin.", success: false })

    if (user.status === 'deleted') return res.status(404).json({ message: "User not found.", success: false })

    const isPasswordMatched = await bcryptjs.compare(password, user.password)

    if (!isPasswordMatched) return res.status(401).json({ message: "Password is incorrect.", success: false })

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    //Create OTP in DB
    const newOtp = new OTP({
      email,
      otp
    })

    await newOtp.save()

    // Send OTP via email
    const sentOtp = await sendOtopEmail(email, otp);

    if (!sentOtp) return res.status(500).json({
      message: "Error in sending OTP. Please try again.",
      success: false
    });

    return res.status(200).json({
      message: "OTP sent to your email address. Please verify OTP to login.",
      success: true,
      data: { email }
    });
  } catch (err) {
    next(err)
  }
}

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) return res.status(400).json({ message: "Please provide all required fields.", success: false })

    const otpDetails = await OTP.findOne({ email, otp })

    if (!otpDetails) return res.status(401).json({ message: "Invalid OTP.", success: false })

    if (otpDetails.createdAt < new Date(Date.now() - 3 * 60 * 1000)) {
      return res.status(401).json({ message: "OTP has expired.", success: false })
    }

    const user = await LOGINMAPPING.findOne({ email })

    const token = jwt.sign({ mongoid: user.mongoid, userType: user.userType, pgcode: user.pgcode }, process.env.JWT, { expiresIn: '7d' })

    res.cookie('pgtoken', token, {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".pgsphere.com" : undefined,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: 'Login Successfully', data: { token, userId: user.mongoid, userType: user.userType, pgcode: user.pgcode }, success: true })

  } catch (err) {
    next(err)
  }
}

export const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies.pgtoken

    if (!token) return res.status(401).json({ message: "No Token Found.", success: false })

    const decoded = jwt.verify(token, process.env.JWT)

    const user = await LOGINMAPPING.findOne({ mongoid: decoded.mongoid })

    if (!user) return res.status(404).json({ message: "User not found.", success: false })

    if (user.status === 'inactive') return res.status(400).json({ message: "Your account is not active. Please contact to admin.", success: false })

    if (user.status === 'deleted') return res.status(400).json({ message: "User not found.", success: false })

    return res.status(200).json({ message: "Token validate successfully.", data: { token, userId: user.mongoid, userType: user.userType }, success: true })

  } catch (err) {
    next(err)
  }
}

export const signupUser = async (req, res, next) => {
  try {
    const { full_name, email, password, contactno, pgname, address } = req.body

    if (!full_name || !email || !password || !contactno || !pgname || !address) return res.status(400).json({ message: "Please provide all required fields." })

    const existUser = await LOGINMAPPING.findOne({ email })

    if (existUser) return res.status(409).json({ message: "Email address is already exist.", success: false })

    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    let newUser = new ADMIN({
      email,
      full_name,
      pg_name: pgname,
      address,
      contactno,
      pgname,
      contactno,
      address
    })


    await newUser.save()

    const pgcode = `PG${newUser._id.toString().slice(-6).toUpperCase()}`

    const newLogin = new LOGINMAPPING({
      mongoid: newUser._id,
      email,
      password: hashedPassword,
      userType: 'Admin',
      pgcode,
    })

    await newLogin.save()

    const DASHBOARD_URL = process.env.NODE_ENV === "production" ? "app.pgsphere.com" : "http://localhost:5173";

    const hasSentEmail = await sendRegistrationEmail(email, pgcode, DASHBOARD_URL);

    if (!hasSentEmail) {
      return res.status(500).json({ message: "Error in sending registration email. Please try again.", success: false })
    }

    return res.status(200).json({ message: `Your Account created successfully. A Dashboard Link and Pgcode has been sent to your email.`, success: true, data: newUser })


  } catch (err) {
    next(err)
  }
}

//For customer side
export const signUpCustomer = async (req, res, next) =>{
   try{
      const {customer_name, pgcode, email, password, mobile_no, room, branch, ref_person_name, ref_person_contact_no, joining_date, added_by, added_by_type} = req.body

      if(!customer_name || !pgcode || !email || !password || !mobile_no || !room || !branch || !joining_date || !added_by || !added_by_type){
         await removeFile(path.join("uploads", "aadhar", req.file.filename))
         return res.status(400).json({message:"Please provide required fields.",success:false})
      }

      if(!req.file) return res.status(400).json({message:"Please upload aadhar card.",success:false})

      const existCustomer = await CUSTOMER.findOne({email,mobile_no})

      if(existCustomer){
        await removeFile(path.join("uploads", "aadhar", req.file.filename))
        return res.status(409).json({message:"User is already exist with same email address or mobile no.",success:false})
      }

      const admin = await LOGINMAPPING.findOne({mongoid:added_by})

      const existBranch = await BRANCH.findOne({_id:branch,pgcode})

      if(!existBranch){
         await removeFile(path.join("uploads", "aadhar", req.file.filename))
         return res.status(400).json({message:"Branch not found.",success:false})
      }

      const existRoom = await ROOM.findOne({_id:room, pgcode})

      if(!existRoom){
        await removeFile(path.join("uploads", "aadhar", req.file.filename))
        return res.status(404).json({message:"Room is not found.",success:false})
      }

      if(existRoom.branch.toString() !== branch){
        await removeFile(path.join("uploads", "aadhar", req.file.filename))
        return res.status(400).json({message:"Requested room is not in given branch.",success:false})
      }

      if(existRoom.filled >= existRoom.capacity){
        await removeFile(path.join("uploads", "aadhar", req.file.filename))
        return res.status(400).json({message:"Room capacity full. Please select another room.",success:false})
      } 

      let imageUrl = `${process.env.DOMAIN}/uploads/aadhar/${req.file.filename}`;

      const saltRounds = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRounds);
      
      const newCustomer = await CUSTOMER({
        customer_name,
        mobile_no,
        email,
        room,
        branch,
        added_by,
        added_by_type,
        ref_person_name,
        ref_person_contact_no,
        joining_date,
        aadharcard_url:imageUrl
      })

      const newLoginMapping = await LOGINMAPPING({
        mongoid:newCustomer._id,
        email,
        password:hashedPassword,
        userType:'Customer',
        status:'pending',
        pgcode,
        expiry:admin.expiry,
        plan:admin.plan
      })

      await newCustomer.save() 
      await newLoginMapping.save()

      return res.status(200).json({message:"New customer account created successfully.",success:true})

   }catch(err){
      next(err)
   }
}

//For customer login
export const customerLogin = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body

    if (!email || !password || !userType) return res.status(200).json({ message: "Please provide all required fields.", success: false })

    const user = await LOGINMAPPING.findOne({ email, userType })

    if (!user) return res.status(404).json({ message: "User not found.", success: false })

    if (user.status === 'inactive') return res.status(400).json({ message: "Your account is not active. Please contact to admin.", success: false })

    if (user.status === 'deleted') return res.status(404).json({ message: "User not found.", success: false })

    if (user.status === 'pending') return res.status(400).json({ message: "Your account is not verified by admin.", success: false })

    const isPasswordMatched = await bcryptjs.compare(password, user.password)

    if (!isPasswordMatched) return res.status(401).json({ message: "Password is incorrect.", success: false })

    const token = jwt.sign({ mongoid: user.mongoid, userType: user.userType, pgcode: user.pgcode }, process.env.JWT, { expiresIn: '30d' })

    res.cookie('pgtoken', token, {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
      domain:
        process.env.NODE_ENV === "production" ? ".pgsphere.com" : undefined,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: 'Login Successfully', data: { token, userId: user.mongoid, userType: user.userType, pgcode: user.pgcode }, success: true })

  } catch (err) {
    next(err)
  }
}

export const genLink = async (req, res, next) => {
  try {

    const { branch } = req.params
    const { pgcode, userType, mongoid } = req

    if (!branch) {
      return res.status(400).json({ message: "Please Provide Branch", success: false })
    }

    if (userType === "Account") {
      const account = await ACCOUNT.findById(mongoid)

      if (!account) return res.status(404).json({ message: "Account manager is not found.", success: false })

      if (!account.branch.includes(branch)) return res.status(403).json({ message: "You are not authorized to Genrate Link to this branch.", success: false })

    }

    const token = jwt.sign({ mongoid, userType, branch, pgcode }, process.env.JWT, { expiresIn: "3d" })

    const url = `${process.env.LINKURL}?token=${token}`

    return res.status(201).json({ message: "Genrate Link Successfully.", url, success: true })

  } catch (error) {
    next(error)
  }
}

export const logoutPortal = async (req, res, next) => {
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