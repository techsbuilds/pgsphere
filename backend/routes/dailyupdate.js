import express from 'express';
import { verifyCustomer, verifyOwner } from '../middleware/verifyUser.js';
import { addDailyUpdate, getAllDailyUpdatesbyBranch, getAllDailyUpdate } from '../controller/dailyUpdateController.js';

const app = express.Router();

app.post('/', verifyOwner, addDailyUpdate);

//For Admin or Acmanager
app.get('/', verifyOwner, getAllDailyUpdate)

//For Customer get Details
app.get('/customer', verifyCustomer, getAllDailyUpdatesbyBranch)

export default app;