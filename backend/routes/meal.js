import express from 'express'
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js'
import { addMeal, getMealDetailsbyWeekly, updateStatusByCustomer, getMealDetailsbyMonthly, getMealDetailsbyDay, updateMeal, getMealDetailsbyDayForOwner } from '../controller/mealController.js'

const app = express.Router()

//For add meal
app.post('/', verifyOwner, addMeal)

//For get Meal by Monthly
app.get('/monthly/:branch', verifyOwner, getMealDetailsbyMonthly)

//For get meal details by weakly
app.get('/weekly/', verifyCustomer, getMealDetailsbyWeekly)

//For get meal details by day
app.get('/:date/',verifyCustomer, getMealDetailsbyDay)

//For get today-meal for Acmanager
app.get('/:date/:branch',verifyOwner,getMealDetailsbyDayForOwner)

//For update meal status by customer
app.put('/', verifyCustomer, updateStatusByCustomer)

//For update meal
app.put('/:mealid/:date', verifyOwner, updateMeal)

export default app