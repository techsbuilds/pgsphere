import CONTACTFORM from "../models/CONTACTFORM.js"

import { sendContctEmail } from "../utils/sendMail.js"


import { sendContactDetailstoEmail } from "../utils/sendMail.js"

export const addContact = async(req,res,next) =>{
    try {
        const { name, email, mobile_no, message } = req.body

        if (!name || !email || !mobile_no) {
            return res.status(400).json({ message: "Please provide all required fields.", success: false })
        }

        const newContact = new CONTACTFORM({
            name,
            email,
            mobile_no,
            message
        })
        await newContact.save()

        const sendData = { name, email, mobile_no, message }

        const hasSendDetails = await sendContctEmail(sendData)

        if (!hasSendDetails) return res.status(500).json({ message: "Error in sending contact details to techBuilds.", success: false })

        return res.status(201).json({ message: "Contact added successfully.", success: true })

        const data = {name, email, mobile_no, message}
        
        const hasSendDetailstoEmail = await sendContactDetailstoEmail(data)

        if(!hasSendDetailstoEmail){
            return res.status(401).json({message:"Unable to send contact details to email.", success:false})
        }

        return res.status(201).json({message:"Contact added successfully.", success:true})

    } catch (error) {
        next(error)
    }
}


export const getAllContacts = async(req,res,next) =>{
    try {
        const contacts = await CONTACTFORM.find()

        return res.status(200).json({ message: "All contacts retrived successfully.", success: true, data: contacts })
    } catch (error) {
        next(error)
    }
}
