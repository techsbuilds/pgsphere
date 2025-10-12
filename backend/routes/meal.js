import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { addMeal, getMealDetailsbyWeekly, updateStatusByCustomer,getMealDetailsbyDay, updateMeal } from '../controller/mealController.js'

const app = express.Router()

//For add meal
app.post('/',verifyToken,addMeal)

//For get meal details by weakly
app.get('/weekly/:branch?',verifyToken,getMealDetailsbyWeekly)

//For get meal details by day
app.get('/:date/:branch?',verifyToken,getMealDetailsbyDay)

//For update meal status by customer
app.put('/',verifyToken,updateStatusByCustomer)

//For update meal
app.put('/:mealid/:date',verifyToken,updateMeal)

export default app