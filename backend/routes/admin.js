import express from 'express'
import { verifyAdmin, verifyHandler } from '../middleware/verifyUser.js'
import { getDashboardSearch, getDashboardSummery,getAdminDetails, updateAdminDetails, changePassword, uploadLogo } from '../controller/adminController.js'
import { logoMulter } from '../middleware/upload.js'

const app = express.Router()


//For get dashboard summery
app.get('/dashboard-summery', verifyAdmin,verifyHandler, getDashboardSummery)

//For get dashboard search
app.get('/dashboard-search/:role', verifyAdmin,verifyHandler, getDashboardSearch)

//For upload pg logo 
app.post('/upload-logo', verifyAdmin, verifyHandler,logoMulter, uploadLogo)

//For get admin details
app.get('/me', verifyAdmin,verifyHandler, getAdminDetails )

//For update admin details
app.put('/me', verifyAdmin,verifyHandler, updateAdminDetails)

//For change password 
app.put('/change-password',verifyAdmin, verifyHandler,changePassword)

export default app