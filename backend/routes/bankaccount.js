import express from 'express'
import { createBankAccount, getAllBankAccount, updateBankAccount, deleteBackAccount, resetBankAccount, resetAllBankAccount } from '../controller/bankAccountController.js'

const app = express.Router()


//For create bank account
app.post('/',createBankAccount)

//For get all bank accounts
app.get('/',getAllBankAccount)

//For update bank account
app.put('/:accountId',updateBankAccount)

//For delete Back Account
app.delete('/:accountId',deleteBackAccount)

//For reset bank account 
app.post('/reset/:accountId',resetBankAccount)

//For reset all bank accounts 
app.post('/resetall', resetAllBankAccount)

export default app