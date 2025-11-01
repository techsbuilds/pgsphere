import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { createFloor, getFloorAndRoomByBranch } from '../controller/floorController.js'

const app = express.Router()


//For Create Floor
app.post('/', verifyToken, createFloor)

//For get Floor and Rooms By Branch
app.get('/:branchId', verifyToken, getFloorAndRoomByBranch)


export default app