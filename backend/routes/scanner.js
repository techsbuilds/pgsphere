import express from 'express'
import { verifyAdmin } from '../middleware/verifyUser.js'
import { addScanner, deleteScanner, getallScanner, getScannerbyBranch, updateScanner, updateStatusScanner } from '../controller/scannerController.js'
import { scannerMulter } from '../middleware/upload.js'

const app = express.Router()

//For create scanner
app.post('/', scannerMulter, addScanner)

//For getAllscanner by Admin
app.get('/', verifyAdmin, getallScanner)

//For getScanner by Branch
app.get('/branch',getScannerbyBranch)

//For updateScanner by Admin
app.put('/:scanner_id', verifyAdmin, scannerMulter, updateScanner)

//For Update Status
app.put('/status/:scanner_id', verifyAdmin, updateStatusScanner)

//For Delete Scanner by Admin
app.delete('/:scanner_id', verifyAdmin, deleteScanner)

export default app