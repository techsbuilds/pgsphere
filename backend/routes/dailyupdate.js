import express from 'express';
import { verifyHandler } from '../middleware/verifyUser.js';
import { addDailyUpdate, getAllDailyUpdatesbyBranch, getAllDailyUpdate } from '../controller/dailyUpdateController.js';

const app = express.Router();

app.post('/', verifyHandler, addDailyUpdate);

//For Admin or Acmanager
app.get('/', verifyHandler, getAllDailyUpdate)

//For Customer get Details
app.get('/customer', getAllDailyUpdatesbyBranch)

export default app;