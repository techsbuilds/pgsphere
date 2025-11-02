import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { addMeal, getMealDetailsbyWeekly, updateStatusByCustomer, getMealDetailsbyDay, updateMeal } from '../controller/mealController.js'

const app = express.Router()

//For add meal
app.post('/', verifyHandler, addMeal)

//For get meal details by weakly
app.get('/weekly/:branch?', getMealDetailsbyWeekly)

//For get meal details by day
app.get('/:date/:branch?', getMealDetailsbyDay)

//For update meal status by customer
app.put('/', updateStatusByCustomer)

//For update meal
app.put('/:mealid/:date', verifyHandler, updateMeal)

export default app