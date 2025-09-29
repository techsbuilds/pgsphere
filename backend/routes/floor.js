import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { createFloor, getFloorByBranch } from '../controller/floorController.js'

const app = express.Router()


//For Create Floor
app.post('/', verifyToken, createFloor)

//For Get Floor By Branch
app.get('/:branchId', verifyToken, getFloorByBranch)


export default app