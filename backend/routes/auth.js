import express from 'express'
import { loginUser, logoutPortal, signupUser, validateToken, verifyOtp } from '../controller/authController.js'

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


export default app