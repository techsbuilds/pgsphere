import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { addMeal, getMealDetailsbyWeekly, updateStatusByCustomer,getMealDetailsbyDay } from '../controller/mealController.js'

const app = express.Router()

app.post('/',verifyToken,addMeal)
app.get('/weekly/:branch',verifyToken,getMealDetailsbyWeekly)
app.get('/:date/:branch',verifyToken,getMealDetailsbyDay)
app.put('/',verifyToken,updateStatusByCustomer)

export default app