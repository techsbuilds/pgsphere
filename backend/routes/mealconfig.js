import express from "express";
import { verifyAdmin } from "../middleware/verifyUser.js";
import { createMealConfig, getMealConfig, updateMealConfig } from "../controller/mealconfigController.js";

const app = express.Router()

//For Creat Meal-config
app.post('/',verifyAdmin,createMealConfig)

//For get meal-config
app.get('/',getMealConfig)

//For update meal-config
app.put('/:mealconfig_id',verifyAdmin,updateMealConfig)

export default app