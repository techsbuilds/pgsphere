import express from 'express'
import { verifyAdmin, verifyHandler } from '../middleware/verifyUser.js'
import { changeAcmanagerStatus, createAccountManager, getAllAcmanager, updateAcManager, getDashboardSearchAcmanger } from '../controller/accountController.js'

const app = express.Router()

//For create account manager
app.post('/', verifyAdmin, verifyHandler, createAccountManager)

//For get all account manager
app.get('/', verifyAdmin, verifyHandler, getAllAcmanager)

//For get Dashboard-Summery
app.get('/dashboard-summery/:role', verifyHandler, getDashboardSearchAcmanger)

//For update account manager
app.put('/:acmanagerId', verifyAdmin, verifyHandler, updateAcManager)

//For change status of acmanager
app.put('/status/:acmanagerId', verifyAdmin, verifyHandler, changeAcmanagerStatus)


export default app