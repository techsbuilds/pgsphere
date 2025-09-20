import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { addDailyUpdate, getAllDailyUpdatesbyBranch,getAllDailyUpdate } from '../controller/dailyUpdateController.js';

const app  = express.Router();

app.post('/',verifyToken,addDailyUpdate);

//For Admin or Acmanager
app.get('/',verifyToken,getAllDailyUpdate)

//For Customer get Details
app.get('/:branch',verifyToken,getAllDailyUpdatesbyBranch)

export default app;