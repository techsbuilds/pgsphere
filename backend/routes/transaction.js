import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { createTransactionForCashout, createTransactionForCustomerRent, createTransactionForDepositeAmount, createTransactionForEmployeeSalary, createTransactionForExtraCharge, createTransactionForInventory, createTransactionForMonthlyPayment, createTransactionForRentByCustomer, getAllTransactions, verifyCustomerTransaction } from '../controller/transactionController.js'
import { paymentProofMulter } from '../middleware/upload.js'

const app = express.Router()

//For create transaction for customer rent
app.post('/customer-rent', verifyHandler, createTransactionForCustomerRent)

//For create transaction for deposite amount
app.post('/deposite', verifyHandler, createTransactionForDepositeAmount)

//For create transaction for extra charges
app.post('/extra-charge', verifyHandler, createTransactionForExtraCharge)

//For create transaction for customer rent (Customer Portal)
app.post('/me/customer-rent', paymentProofMulter, createTransactionForRentByCustomer)

//For create transaction for Employee salary
app.post('/employee-salary', verifyHandler, createTransactionForEmployeeSalary)

//For create transaction for inventory item
app.post('/inventory-purchase', verifyHandler, createTransactionForInventory)

//For create transaction for monthly payment
app.post('/monthly-payment', verifyHandler, createTransactionForMonthlyPayment)

//For create transaction for cashout pay
app.post('/cashout-pay', verifyHandler, createTransactionForCashout)

//For get all transactions
app.get('/', verifyHandler, getAllTransactions)

//For verify customer transaction
app.post('/customer-transaction/verify', verifyHandler, verifyCustomerTransaction)

export default app