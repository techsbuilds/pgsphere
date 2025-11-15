import express from 'express'
import { getAllCashOutTransaction } from '../controller/cashOutController.js'

const app = express.Router()


//For get all cashouts 
app.get('/', getAllCashOutTransaction)


export default app