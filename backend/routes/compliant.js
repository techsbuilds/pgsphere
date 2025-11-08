import express from 'express'
import { addComplaint, closeComplaints, getAllComplaints, getAllComplaintsbyBranch } from '../controller/complaintController.js'
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js'

const app = express.Router()

app.post('/', verifyCustomer, addComplaint)
app.get('/', verifyOwner, getAllComplaints)
app.get('/customer', verifyCustomer, getAllComplaintsbyBranch)
app.put('/:com_id', verifyOwner, closeComplaints)

export default app