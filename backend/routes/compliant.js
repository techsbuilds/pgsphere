import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { addComplaint, closeComplaints, getAllComplaints, getAllComplaintsbyBranch } from '../controller/complaintController.js'

const app = express.Router()

app.post('/',verifyToken,addComplaint)
app.get('/',verifyToken,getAllComplaints)
app.get('/customer',verifyToken,getAllComplaintsbyBranch)
app.put('/:com_id',verifyToken,closeComplaints)

export default app