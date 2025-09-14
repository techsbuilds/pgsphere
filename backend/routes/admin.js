import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/verifyUser.js'
import { getDashboardSearch, getDashboardSummery, updateAdminDetails, changePassword, uploadLogo } from '../controller/adminController.js'
import { logoMulter } from '../middleware/upload.js'

const app = express.Router()


//For get dashboard summery
app.get('/dashboard-summery', verifyToken, verifyAdmin, getDashboardSummery)

//For get dashboard search
app.get('/dashboard-search/:role', verifyToken, verifyAdmin, getDashboardSearch)

//For upload pg logo 
app.post('/upload-logo', verifyToken, verifyAdmin, logoMulter, uploadLogo)

//For update admin details
app.put('/me', verifyToken, verifyAdmin, updateAdminDetails)

//For change password 
app.put('/change-password', verifyToken, changePassword)

export default app