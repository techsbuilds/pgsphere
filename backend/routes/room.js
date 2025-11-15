import express from 'express'
import { createRoom, getRoomByBranchId, getRoomById, updateRoom } from '../controller/roomController.js'

const app = express.Router()

//For create room
app.post('/',createRoom)

//For update room 
app.put('/:roomId', updateRoom)

//Get Rooms by branch id
app.get('/branch/:branchId', getRoomByBranchId)

//Get Room by room id
app.get('/:roomId', getRoomById)

export default app