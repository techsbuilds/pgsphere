import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { changeStatus, createCustomer, getAllCustomer, getCustomerByBranchId, getCustomerByRoomId, getCustomerDetailsForCustomer, getPendingCustomerRentList, updateCustomerDetails, exportCustomersToExcel, verifyCustomer, updateCustomerByCustomer, getCustomerPendingRentListById, getCustomerRentListForCustomer, getDashboardSummary } from '../controller/customerController.js'
import { aadharCardMulter } from '../middleware/upload.js'

const app = express.Router()

//For create new customer
app.post('/', verifyHandler, aadharCardMulter, createCustomer)

//For get all customer
app.get('/', verifyHandler, getAllCustomer)

//For get customer by room id
app.get('/room/:roomId', verifyHandler, getCustomerByRoomId)

//For get customer by branch id
app.get('/branch/:branchId', verifyHandler, getCustomerByBranchId)

//For get customer by customer
app.get('/me', getCustomerDetailsForCustomer)

//For change customer status
app.put('/status/:customerId', verifyHandler, changeStatus)

//For get pending customer rents
app.get('/pending-rent', verifyHandler, getPendingCustomerRentList)

//For export data in excel files
app.get('/export/excel', verifyHandler, exportCustomersToExcel)

//For verify customer details
app.post('/verify-customer/:customerId', verifyHandler, verifyCustomer)

//For get pending customer rent list by id
app.get('/pending-rent/:customerId', verifyHandler, getCustomerPendingRentListById)

//For update customer details by customer
app.put('/me', updateCustomerByCustomer)

//For update customer details
app.put('/:customerId', verifyHandler, aadharCardMulter, updateCustomerDetails)

//For get customer rent list for customer portal 
app.get('/me/rent-list', getCustomerRentListForCustomer)

//For get Dashboard Summary by Customer
app.get('/dashboard/me', getDashboardSummary)

export default app