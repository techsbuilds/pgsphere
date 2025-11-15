import express from 'express'
import { getAllInventoryTransaction, addInventoryPurchase, distributeInventory, getAllInventoryPurchases } from '../controller/inventoryController.js'

const app = express.Router()

//For get all inventory transaction
app.get('/', getAllInventoryTransaction)

// For get all inventory purchases
app.get('/purchases', getAllInventoryPurchases)

// For add inventory purchase
app.post('/purchase', addInventoryPurchase)

// For distribute inventory
app.post('/distribute', distributeInventory)

export default app
