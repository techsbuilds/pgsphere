import express from 'express'
import { customerLogin, loginUser, genLink, logoutPortal, signUpCustomer, signupUser, validateToken, verifyOtp, verifyCustomerSignup, verifyTokenForPassword, forgetPasswordCustomer, sendEmailForgetPassword } from '../controller/authController.js'
import { aadharCardMulter } from '../middleware/upload.js'
import { verifyOwner } from '../middleware/verifyUser.js'

const app = express.Router()

//Login
app.post('/sign-in', loginUser)

//Sign up
app.post('/sign-up', signupUser)

//Validate token
app.post('/validate-token', validateToken)

//Logout
app.get('/logout', logoutPortal)

// verify otp
app.post('/verify-otp', verifyOtp)

//For customer signup
app.post('/customer/sign-up', aadharCardMulter, signUpCustomer)

//For Customer login
app.post('/customer/sign-in', customerLogin)

//Genrate-Link
app.get('/link/:branch', verifyOwner, genLink)

//For verify customer generate token
app.get('/verify/customer/signup/:token', verifyCustomerSignup)


// //get Branch-details
// app.get('/:token',verifyCustomerRegister)


//For send password reset link to customer email
app.post('/sendmail',sendEmailForgetPassword)

//For verify token for password reset
app.get('/verify-token',verifyTokenForPassword)

//For forget password customer
app.post('/reset-password',forgetPasswordCustomer)

export default app
