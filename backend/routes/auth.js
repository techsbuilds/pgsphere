import express from 'express'
import { genLink, loginUser, logoutPortal, signupUser, validateToken, verifyOtp,verifyCustomerRegister } from '../controller/authController.js'
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

//Genrate-Link
app.get('/link/:branch',verifyToken,genLink)

//get Branch-details
app.get('/:token',verifyCustomerRegister)

export default app
