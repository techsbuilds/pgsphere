import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { createFloor, getFloorAndRoomByBranch } from '../controller/floorController.js'

const app = express.Router()


//For Create Floor
app.post('/', verifyHandler, createFloor)

//For get Floor and Rooms By Branch
app.get('/:branchId', verifyHandler, getFloorAndRoomByBranch)


export default app