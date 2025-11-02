import express from 'express'
import {verifyHandler } from '../middleware/verifyUser.js'
import { getAllCashOutTransaction } from '../controller/cashOutController.js'

const app = express.Router()


//For get all cashouts 
app.get('/', verifyHandler, getAllCashOutTransaction)


export default app