import express from 'express'
import { addContact ,getAllContacts} from '../controller/contactController.js'

const app = express.Router()

//For add contact
app.post('/',addContact)
app.get('/',getAllContacts)
export default app
