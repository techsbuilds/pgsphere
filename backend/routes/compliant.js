import express from 'express'
import { addComplaint, closeComplaints, getAllComplaints, getAllComplaintsbyBranch } from '../controller/complaintController.js'
import { verifyHandler } from '../middleware/verifyUser.js'

const app = express.Router()

app.post('/',addComplaint)
app.get('/',verifyHandler,getAllComplaints)
app.get('/customer',getAllComplaintsbyBranch)
app.put('/:com_id',closeComplaints)

export default app