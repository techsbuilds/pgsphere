import express from 'express'
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js'
import { changeStatus, createCustomer, getAllCustomer, getCustomerByBranchId, getCustomerByRoomId, getCustomerDetailsForCustomer, getPendingCustomerRentList, updateCustomerDetails, exportCustomersToExcel, verifyCustomerLogin, updateCustomerByCustomer, getCustomerPendingRentListById, getCustomerRentListForCustomer, getDashboardSummary, changeCustomerPassword, changeRoom } from '../controller/customerController.js'
import { customerMulter } from '../middleware/upload.js'

const app = express.Router()

//For create new customer
app.post('/', verifyOwner, customerMulter, createCustomer)

//For get all customer
app.get('/', verifyOwner, getAllCustomer)

//For get customer by room id
app.get('/room/:roomId', verifyOwner, getCustomerByRoomId)

//For get customer by branch id
app.get('/branch/:branchId', verifyOwner, getCustomerByBranchId)

//For get customer by customer
app.get('/me', verifyCustomer, getCustomerDetailsForCustomer)

//For change customer status
app.put('/status/:customerId', verifyOwner, changeStatus)

//For get pending customer rents
app.get('/pending-rent', verifyOwner, getPendingCustomerRentList)

//For export data in excel files
app.get('/export/excel', verifyOwner, exportCustomersToExcel)

//For verify customer details
app.post('/verify-customer/:customerId', verifyOwner, verifyCustomerLogin)

//For get pending customer rent list by id
app.get('/pending-rent/:customerId', verifyOwner, getCustomerPendingRentListById)

//For update customer details by customer
app.put('/me', verifyCustomer, updateCustomerByCustomer)

//For update customer details
app.put('/:customerId', verifyOwner, customerMulter, updateCustomerDetails)

//For get customer rent list for customer portal 
app.get('/me/rent-list', verifyCustomer, getCustomerRentListForCustomer)

//For get Dashboard Summary by Customer
app.get('/dashboard/me', verifyCustomer, getDashboardSummary)

//For Change Customer Password
app.post('/change-password/me',verifyCustomer,changeCustomerPassword)

//For change room
app.put('/change-room/:customerId', verifyOwner, changeRoom)
export default app