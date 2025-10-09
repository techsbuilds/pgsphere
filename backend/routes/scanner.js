import express from 'express'
import { verifyAdmin, verifyToken } from '../middleware/verifyUser.js'
import { addScanner, getallScanner, getScannerbyBranch, updateScanner, updateStatusScanner } from '../controller/scannerController.js'
import { scannerMulter } from '../middleware/upload.js'

const app = express.Router()

//For create scanner
app.post('/', verifyToken, scannerMulter, addScanner)

//For getAllscanner by Admin
app.get('/', verifyToken, verifyAdmin, getallScanner)

//For getScanner by Branch
app.get('/branch', verifyToken, getScannerbyBranch)

//For updateScanner by Admin
app.put('/:scanner_id', verifyToken, verifyAdmin, scannerMulter, updateScanner)

//For Update Status
app.put('/status/:scanner_id',verifyToken,verifyAdmin,updateStatusScanner)


export default app