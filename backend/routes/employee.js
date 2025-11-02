import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { changeEmployeeStatus, createEmployee, getAllEmployee, getEmployeePendingSalaries, updateEmployee, exportEmployeeToExcel } from '../controller/employeeController.js'

const app = express.Router()

//For create employee
app.post('/', verifyHandler, createEmployee)

//For get All employee
app.get('/', verifyHandler, getAllEmployee)

//For update employee details
app.put('/:employeeId', verifyHandler, updateEmployee)

//For change status of employee
app.put('/status/:employeeId', verifyHandler, changeEmployeeStatus)

//For get employee salary details
app.get('/salary-details', verifyHandler, getEmployeePendingSalaries)

app.get('/export/excel', verifyHandler, exportEmployeeToExcel);

export default app
