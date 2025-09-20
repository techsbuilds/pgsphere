import express from 'express'
import { verifyToken } from '../middleware/verifyUser'
import { addComplaint, closeComplaints, getAllComplaints, getAllComplaintsbyBranch } from '../controller/complaintController'


const app = express.Router()

app.post('/',verifyToken,addComplaint)
app.get('/',verifyToken,getAllComplaints)
app.get('/customer',verifyToken,getAllComplaintsbyBranch)
app.put('/:com_id',verifyToken,closeComplaints)