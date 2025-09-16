import express from 'express'
import { addContact ,getAllContacts} from '../controller/contactController.js'

const router = express.Router()

router.use((req, res, next) => {
    console.log("📩 Contact route hit:", req.method, req.originalUrl);
    next();
});

//For add contact
router.post('/',addContact)
router.get('/',getAllContacts)
export default router
