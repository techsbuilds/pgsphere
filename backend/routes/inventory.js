import express from 'express'
import { verifyHandler } from '../middleware/verifyUser.js'
import { getAllInventoryTransaction, addInventoryPurchase, distributeInventory, getAllInventoryPurchases } from '../controller/inventoryController.js'

const app = express.Router()

//For get all inventory transaction
app.get('/', verifyHandler, getAllInventoryTransaction)

// For get all inventory purchases
app.get('/purchases', verifyHandler, getAllInventoryPurchases)

// For add inventory purchase
app.post('/purchase', verifyHandler, addInventoryPurchase)

// For distribute inventory
app.post('/distribute', verifyHandler, distributeInventory)

export default app
