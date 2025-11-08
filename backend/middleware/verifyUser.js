import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import LOGINMAPPING from '../models/LOGINMAPPING.js'
import CUSTOMER from '../models/CUSTOMER.js'

dotenv.config()


export const verifyOwner = async (req, res, next) => {
    const token = req.cookies.pgtoken

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.', success: false })

    try {

        const decoded = jwt.verify(token, process.env.JWT)

        req.mongoid = decoded.mongoid
        req.userType = decoded.userType
        req.pgcode = decoded.pgcode;

        if (userType === "Admin" || userType === "Account") {
            next()
        } else {
            return res.status(403).json({ message: "You are not Autherized to Perform this task.", success: false })
        }

        if (req.userType === "Account") {
            let isActiveAccount = await LOGINMAPPING.findOne({ mongoid: req.mongoid, pgcode: req.pgcode, status: true })

            if (!isActiveAccount) return res.status(403).json({ message: "Your account is not active.", success: false })
        }

    } catch (err) {
        return res.status(400).json({ message: "Invalid token.", success: false })
    }
}

export const verifyCustomer = async (req, res, next) => {
    const token = req.cookies.pgcustomertoken

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.', success: false })

    try {

        const decoded = jwt.verify(token, process.env.JWT)

        req.mongoid = decoded.mongoid
        req.userType = decoded.userType
        req.pgcode = decoded.pgcode;

        if (req.userType === 'Customer') {
            let customer = await CUSTOMER.findById(req.mongoid)

            if (!customer) {
                return res.status(404).json({ message: "Customer Not Fount.", success: false })
            }

            req.branch = customer.branch
        } else {
            return res.status(400).json({ message: "You are not Customer so , you can't perform this task.", success: false })
        }

        next()
    } catch (error) {
        return res.status(401).json({ message: "Customer-Token Invalid", success: false })
    }

}

export const verifyAdmin = async (req, res, next) => {
    const userType = req.userType

    if (userType && userType === 'Admin') {
        next()
    } else {
        return res.status(400).json({ message: "You are not Autherized to Perform this Task", success: false })
    }
}

