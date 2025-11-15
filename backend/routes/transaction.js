import express from 'express'
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js'
import { createTransactionForCashout, createTransactionForCustomerRent, createTransactionForDepositeAmount, createTransactionForEmployeeSalary, createTransactionForExtraCharge, createTransactionForInventory, createTransactionForMonthlyPayment, createTransactionForRentByCustomer, getAllTransactions, verifyCustomerTransaction } from '../controller/transactionController.js'
import { paymentProofMulter } from '../middleware/upload.js'

const app = express.Router()

//For create transaction for customer rent
app.post('/customer-rent', verifyOwner, createTransactionForCustomerRent)

//For create transaction for deposite amount
app.post('/deposite', verifyOwner, createTransactionForDepositeAmount)

//For create transaction for extra charges
app.post('/extra-charge', verifyOwner, createTransactionForExtraCharge)

//For create transaction for customer rent (Customer Portal)
app.post('/me/customer-rent',verifyCustomer, paymentProofMulter, createTransactionForRentByCustomer)

//For create transaction for Employee salary
app.post('/employee-salary', verifyOwner, createTransactionForEmployeeSalary)

//For create transaction for inventory item
app.post('/inventory-purchase', verifyOwner, createTransactionForInventory)

//For create transaction for monthly payment
app.post('/monthly-payment', verifyOwner, createTransactionForMonthlyPayment)

//For create transaction for cashout pay
app.post('/cashout-pay', verifyOwner, createTransactionForCashout)

//For get all transactions
app.get('/', verifyOwner, getAllTransactions)

//For verify customer transaction
app.post('/customer-transaction/verify', verifyOwner, verifyCustomerTransaction)

export default app