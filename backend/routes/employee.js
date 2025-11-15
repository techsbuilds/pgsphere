import express from 'express'
import { changeEmployeeStatus, createEmployee, getAllEmployee, getEmployeePendingSalaries, updateEmployee, exportEmployeeToExcel } from '../controller/employeeController.js'

const app = express.Router()

//For create employee
app.post('/', createEmployee)

//For get All employee
app.get('/', getAllEmployee)

//For update employee details
app.put('/:employeeId', updateEmployee)

//For change status of employee
app.put('/status/:employeeId', changeEmployeeStatus)

//For get employee salary details
app.get('/salary-details', getEmployeePendingSalaries)

app.get('/export/excel', exportEmployeeToExcel);

export default app
