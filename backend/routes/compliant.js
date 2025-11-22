import express from 'express'
import { addComplaint, closeComplaints, getAllComplaints, getAllComplaintsbyBranch } from '../controller/complaintController.js'
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js'

const app = express.Router()
//For adding a complaint
app.post('/', verifyCustomer, addComplaint)

//For getting all complaints
app.get('/', verifyOwner, getAllComplaints)

//For getting all complaints by branch
app.get('/customer', verifyCustomer, getAllComplaintsbyBranch)

//For closing a complaint
app.put('/:com_id', verifyOwner, closeComplaints)

export default app