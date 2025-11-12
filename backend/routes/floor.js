import express from 'express'
import { createFloor, getFloorAndRoomByBranch } from '../controller/floorController.js'

const app = express.Router()


//For Create Floor
app.post('/', createFloor)

//For get Floor and Rooms By Branch
app.get('/:branchId', getFloorAndRoomByBranch)


export default app