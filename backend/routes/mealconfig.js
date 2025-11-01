import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/verifyUser.js";
import { createMealConfig, getMealConfig, updateMealConfig } from "../controller/mealconfigController.js";

const app = express.Router()

//For Creat Meal-config
app.post('/',verifyToken,verifyAdmin,createMealConfig)

//For get meal-config
app.get('/',verifyToken,getMealConfig)

//For update meal-config
app.put('/:mealconfig_id',verifyToken,verifyAdmin,updateMealConfig)

export default app