import mongoose from "mongoose"
import ACCOUNT from "../models/ACCOUNT.js"
import COMPLAINT from "../models/COMPLAINT.js"
import CUSTOMER from "../models/CUSTOMER.js"


export const addComplaint = async (req, res, next) => {
    try {
        const { pgcode, mongoid } = req
        const { subject, description, category } = req.body

        if (!subject || !description || !category) {
            return res.status(400).json({ message: "Please Provided All Fields", success: false })
        }

        const customer = await CUSTOMER.findById(mongoid)

        if (!customer) {
            return res.status(404).json({ message: "Sorry You Are Not Autherized to Add Complaints,", success: false })
        }

        const branch = customer.branch

        const newCompaint = COMPLAINT({
            subject,
            description,
            category,
            added_by: mongoid,
            pgcode,
            branch
        })

        await newCompaint.save()

        return res.status(201).json({ message: "Complaint Successfully Created By Customer.", success: true })

    } catch (error) {
        next(error)
    }
}

export const getAllComplaintsbyBranch = async (req, res, next) => {
    try {
        const { pgcode, mongoid } = req

        const customer = await CUSTOMER.findById(mongoid)

        if (!customer) {
            return res.status(404).json({ message: "Customer Not Found.", success: false })
        }

        const branch = customer.branch

        const complaintsData = await COMPLAINT.find({ pgcode, branch }).populate('added_by').sort({ createdAt: -1 })

        return res.status(200).json({ message: "Successfully Getting Complaints by Customer. ", data: complaintsData, success: true })

    } catch (error) {
        next(error)
    }
}

export const getAllComplaints = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req
        const { branch } = req.query

        let filter = {}
        filter.pgcode = pgcode

        if (userType === "Account") {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmanager Not Found", success: false })
            }

            const branches = acmanager.branch

            if (branch) {
                filter.branch = branch
            } else {
                filter.branch = { $in: branches }
            }

        } else {
            if (branch) {
                filter.branch = branch
            }
        }

        const complaintsData = await COMPLAINT.find(filter).populate('added_by').sort({ createdAt: -1 })

        return res.status(200).json({ message: "Successfully Retrive Complaints-Data.", data: complaintsData, success: true })

    } catch (error) {
        next(error)
    }
}

export const closeComplaints = async (req, res, next) => {
    try {

        const { com_id } = req.params
        const { userType, mongoid, pgcode } = req

        const complaint = await COMPLAINT.findById(com_id)

        if (!complaint) {
            return res.status(404).json({ message: "Complaint Not Found.", success: false })
        }

        if (complaint.pgcode !== pgcode) {
            return res.status(400).json({ message: "You are Not Autherized to Close this Complaint", success: false })
        }

        if (complaint.status === "Close") {
            return res.status(200).json({ message: "Complaint Already Solved ", success: true })
        }

        const branch = complaint.branch

        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmanager Not Found.", success: false })
            }

            const branches = acmanager.branch

            if (branches.includes(branch)) {
                return res.status(402).json({ message: "You are Not Autherized to Access This Data", success: false })
            }

        }

        complaint.status = "Close"
        complaint.close_by = mongoid
        complaint.close_by_type = userType

        await complaint.save()

        return res.status(200).json({ message: "Complaint Solve !.", success: true })

    } catch (error) {
        next(error)
    }
}