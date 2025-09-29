import express from 'express'
import { customerLogin, loginUser, logoutPortal, signUpCustomer, signupUser, validateToken, verifyOtp } from '../controller/authController.js'
import { aadharCardMulter } from '../middleware/upload.js'

const app = express.Router()

//Login
app.post('/sign-in',loginUser)

//Sign up
app.post('/sign-up',signupUser)

//Validate token
app.post('/validate-token',validateToken)

//Logout
app.get('/logout',logoutPortal)

// verify otp
app.post('/verify-otp',verifyOtp)

//For customer signup
app.post('/customer/sign-up', aadharCardMulter, signUpCustomer)

//For Customer login
app.post('/customer/sign-in', customerLogin)


export default app