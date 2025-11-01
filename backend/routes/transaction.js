import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/verifyUser.js'
import { createTransactionForCashout, createTransactionForCustomerRent, createTransactionForDepositeAmount, createTransactionForEmployeeSalary, createTransactionForExtraCharge, createTransactionForInventory, createTransactionForMonthlyPayment, createTransactionForRentByCustomer, getAllTransactions, verifyCustomerTransaction } from '../controller/transactionController.js'
import { paymentProofMulter } from '../middleware/upload.js'

const app = express.Router()

//For create transaction for customer rent
app.post('/customer-rent', verifyToken, createTransactionForCustomerRent)

//For create transaction for deposite amount
app.post('/deposite', verifyToken, createTransactionForDepositeAmount)

//For create transaction for extra charges
app.post('/extra-charge', verifyToken, createTransactionForExtraCharge)

//For create transaction for customer rent (Customer Portal)
app.post('/me/customer-rent', verifyToken, paymentProofMulter, createTransactionForRentByCustomer)

//For create transaction for customer salary
app.post('/employee-salary', verifyToken, createTransactionForEmployeeSalary)

//For create transaction for inventory item
app.post('/inventory-purchase', verifyToken, createTransactionForInventory)

//For create transaction for monthly payment
app.post('/monthly-payment', verifyToken, createTransactionForMonthlyPayment)

//For create transaction for cashout pay
app.post('/cashout-pay', verifyToken, createTransactionForCashout)

//For get all transactions
app.get('/', verifyToken, getAllTransactions)

//For verify customer transaction
app.post('/customer-transaction/verify', verifyToken, verifyCustomerTransaction)

export default app