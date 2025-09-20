import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/verifyUser.js'
import { changeAcmanagerStatus, createAccountManager, getAllAcmanager, updateAcManager,getDashboardSearchAcmanger } from '../controller/accountController.js'

const app = express.Router()

//For create account manager
app.post('/', verifyToken, verifyAdmin, createAccountManager)

//For get all account manager
app.get('/', verifyToken, verifyAdmin, getAllAcmanager)

//For get Dashboard-Summery
app.get('/dashboard-summery/:role', verifyToken, getDashboardSearchAcmanger)

//For update account manager
app.put('/:acmanagerId', verifyToken, verifyAdmin, updateAcManager)

//For change status of acmanager
app.put('/status/:acmanagerId', verifyToken, verifyAdmin, changeAcmanagerStatus)


export default app