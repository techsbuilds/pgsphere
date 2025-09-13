import express from 'express'
import {verifyToken } from '../middleware/verifyUser.js'
import { changeEmployeeStatus, createEmployee, getAllEmployee, getEmployeePendingSalaries, updateEmployee } from '../controller/employeeController.js'

const app = express.Router()

//For create employee
app.post('/',verifyToken, createEmployee)

//For get All employee
app.get('/', verifyToken, getAllEmployee)

//For update employee details
app.put('/:employeeId', verifyToken, updateEmployee)

//For change status of employee
app.put('/status/:employeeId', verifyToken, changeEmployeeStatus)

//For get employee salary details
app.get('/salary-details', verifyToken, getEmployeePendingSalaries)

export default app
