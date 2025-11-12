import express from 'express'
import { verifyAdmin } from '../middleware/verifyUser.js'
import { getDashboardSearch, getDashboardSummery, getAdminDetails, updateAdminDetails, changePassword, uploadLogo } from '../controller/adminController.js'
import { logoMulter } from '../middleware/upload.js'

const app = express.Router()


//For get dashboard summery
app.get('/dashboard-summery', verifyAdmin, getDashboardSummery)

//For get dashboard search
app.get('/dashboard-search/:role', verifyAdmin, getDashboardSearch)

//For upload pg logo 
app.post('/upload-logo', verifyAdmin, logoMulter, uploadLogo)

//For get admin details
app.get('/me', verifyAdmin, getAdminDetails)

//For update admin details
app.put('/me', verifyAdmin, updateAdminDetails)

//For change password 
app.put('/change-password', verifyAdmin, changePassword)

export default app