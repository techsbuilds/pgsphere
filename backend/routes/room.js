import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { createRoom, getRoomByBranchId, getRoomById, updateRoom } from '../controller/roomController.js'

const app = express.Router()

//For create room
app.post('/',verifyHandler,createRoom)

//For update room 
app.put('/:roomId',verifyHandler, updateRoom)

//Get Rooms by branch id
app.get('/branch/:branchId',verifyHandler, getRoomByBranchId)

//Get Room by room id
app.get('/:roomId',verifyHandler, getRoomById)

export default app