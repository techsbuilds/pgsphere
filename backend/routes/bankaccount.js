import express from 'express'
import { createBankAccount, getAllBankAccount, updateBankAccount, deleteBackAccount, resetBankAccount, resetAllBankAccount } from '../controller/bankAccountController.js'
import { verifyToken, verifyAdmin } from '../middleware/verifyUser.js'

const app = express.Router()


//For create bank account
app.post('/', verifyToken, verifyAdmin, createBankAccount)

//For get all bank accounts
app.get('/', verifyToken, verifyAdmin, getAllBankAccount)

//For update bank account
app.put('/:accountId', verifyToken, updateBankAccount)

//For delete Back Account
app.delete('/:accountId', verifyToken, verifyAdmin, deleteBackAccount)

//For reset bank account 
app.post('/reset/:accountId', verifyToken, verifyAdmin, resetBankAccount)

//For reset all bank accounts 
app.post('/resetall', verifyToken, verifyAdmin, resetAllBankAccount)

export default app