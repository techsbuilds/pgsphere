import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { addMeal, getMealDetails, updateStatusByCustomer } from '../controller/mealController.js'

const app = express.Router()

app.post('/',verifyToken,addMeal)
app.get('/',verifyToken,getMealDetails)
app.put('/',verifyToken,updateStatusByCustomer)

export default app