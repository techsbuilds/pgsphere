import express from 'express'

import { customerLogin, loginUser, genLink, logoutPortal, signUpCustomer, signupUser, validateToken, verifyOtp } from '../controller/authController.js'

import { aadharCardMulter } from '../middleware/upload.js'
import { verifyToken } from '../middleware/verifyUser.js'

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


//Genrate-Link
app.get('/link/:branch',verifyToken,genLink)

// //get Branch-details
// app.get('/:token',verifyCustomerRegister)

export default app
