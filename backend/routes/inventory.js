import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import { getAllInventoryTransaction, addInventoryPurchase, distributeInventory, getAllInventoryPurchases } from '../controller/inventoryController.js'

const app = express.Router()

//For get all inventory transaction
app.get('/', verifyToken, getAllInventoryTransaction)

// For get all inventory purchases
app.get('/purchases', verifyToken, getAllInventoryPurchases)

// For add inventory purchase
app.post('/purchase', verifyToken, addInventoryPurchase)

// For distribute inventory
app.post('/distribute', verifyToken, distributeInventory)

export default app
