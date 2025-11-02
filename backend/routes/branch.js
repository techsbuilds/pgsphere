import express from 'express';
import { verifyAdmin, verifyHandler } from '../middleware/verifyUser.js';
import { branchMulter } from '../middleware/upload.js';
import { createBranch, getAllBranch, getBranchById, getDashboardSummery, updateBranch } from '../controller/branchController.js';

const app = express.Router()

//For create branch
app.post('/', verifyAdmin, branchMulter, createBranch)

//For get all branch
app.get('/', verifyHandler, getAllBranch)

//For update branch details
app.put('/:branchId', verifyAdmin, branchMulter, updateBranch)

//Get branch details by id
app.get('/:branchId', verifyHandler, getBranchById)

//Get dashboatd summery
app.get('/dashboard-summery/:branchId', verifyHandler, getDashboardSummery)
export default app