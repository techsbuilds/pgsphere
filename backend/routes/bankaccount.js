import express from 'express'
import { createBankAccount, getAllBankAccount, updateBankAccount, deleteBackAccount, resetBankAccount, resetAllBankAccount } from '../controller/bankAccountController.js'
import { verifyAdmin } from '../middleware/verifyUser.js'

const app = express.Router()


//For create bank account
app.post('/', verifyAdmin,createBankAccount)

//For get all bank accounts
app.get('/', verifyAdmin,getAllBankAccount)

//For update bank account
app.put('/:accountId', verifyAdmin,updateBankAccount)

//For delete Back Account
app.delete('/:accountId', verifyAdmin,deleteBackAccount)

//For reset bank account 
app.post('/reset/:accountId', verifyAdmin,resetBankAccount)

//For reset all bank accounts 
app.post('/resetall', verifyAdmin, resetAllBankAccount)

export default app