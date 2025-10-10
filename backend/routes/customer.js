import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { changeStatus, createCustomer, getAllCustomer, getCustomerByBranchId, getCustomerByRoomId, getCustomerDetailsForCustomer, getPendingCustomerRentList, updateCustomerDetails, exportCustomersToExcel, verifyCustomer, updateCustomerByCustomer } from '../controller/customerController.js'
import { aadharCardMulter } from '../middleware/upload.js'

const app = express.Router()

//For create new customer
app.post('/', verifyToken, aadharCardMulter, createCustomer)

//For get all customer
app.get('/', verifyToken, getAllCustomer)

//For get customer by room id
app.get('/room/:roomId', verifyToken, getCustomerByRoomId)

//For get customer by branch id
app.get('/branch/:branchId', verifyToken, getCustomerByBranchId)

//For get customer by customer
app.get('/me', verifyToken, getCustomerDetailsForCustomer)

//For change customer status
app.put('/status/:customerId', verifyToken, changeStatus)

//For get pending customer rents
app.get('/pending-rent', verifyToken, getPendingCustomerRentList)

//For export data in excel files
app.get('/export/excel', verifyToken, exportCustomersToExcel)

//For verify customer details
app.post('/verify-customer/:customerId', verifyToken, verifyCustomer)

//For update customer details by customer
app.put('/me', verifyToken, updateCustomerByCustomer)

//For update customer details
app.put('/:customerId', verifyToken, updateCustomerDetails)
export default app