import express from "express";
import { verifyAdmin, verifyCustomer, verifyOwner } from "../middleware/verifyUser.js";
import { createMealConfig, getMealConfig, updateMealConfig } from "../controller/mealconfigController.js";

const app = express.Router()

//For Creat Meal-config
app.post('/',verifyAdmin,createMealConfig)

//For get meal-config
app.get('/', verifyOwner,getMealConfig)

//For get meal-config for customer 
app.get('/customer',verifyCustomer,getMealConfig)

//For update meal-config
app.put('/:mealconfig_id', verifyOwner, updateMealConfig)

export default app