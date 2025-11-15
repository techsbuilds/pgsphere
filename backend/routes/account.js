import express from 'express'
import { verifyAdmin } from '../middleware/verifyUser.js'
import { changeAcmanagerStatus, createAccountManager, getAllAcmanager, updateAcManager, getDashboardSearchAcmanger } from '../controller/accountController.js'

const app = express.Router()

//For create account manager
app.post('/', verifyAdmin, createAccountManager)

//For get all account manager
app.get('/', verifyAdmin, getAllAcmanager)

//For get Dashboard-Summery
app.get('/dashboard-summery/:role', getDashboardSearchAcmanger)

//For update account manager
app.put('/:acmanagerId', verifyAdmin, updateAcManager)

//For change status of acmanager
app.put('/status/:acmanagerId', verifyAdmin, changeAcmanagerStatus)


export default app