import express from 'express'
import { addContact ,getAllContacts} from '../controller/contactController.js'

const router = express.Router()

//For add contact
router.post('/',addContact)
router.get('/',getAllContacts)
export default router
