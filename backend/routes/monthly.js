import express from 'express'
import { verifyAdmin } from '../middleware/verifyUser.js'
import { createMonthlyPayment, deleteMonthlyBill, getMonthlyPaymentsList, updateMonthlyPaymentDetails } from '../controller/monthlyPayController.js'

const app = express.Router()

//For create monthly payment
app.post('/', verifyAdmin, createMonthlyPayment)

//For get list of monthly payments
app.get('/', getMonthlyPaymentsList)

//For update monthly payment details 
app.put('/:billId', verifyAdmin, updateMonthlyPaymentDetails)

//For delete monthly payment bill
app.delete('/:billId', verifyAdmin, deleteMonthlyBill)

export default app