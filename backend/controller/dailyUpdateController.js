import ACCOUNT from "../models/ACCOUNT.js"
import CUSTOMER from "../models/CUSTOMER.js"
import DAILYUPDATE from "../models/DAILYUPDATE.js"

export const addDailyUpdate = async (req, res, next) => {
    try {
        const { title, content_type, branch } = req.body
        const { pgcode, userType, mongoid } = req

        if (!title || !content_type || !branch) {
            return res.status(400).json({ message: "Please Provide All Requireed Fields", success: false })
        }

        const newDailyUpdate = new DAILYUPDATE({
            title,
            content_type,
            pgcode,
            branch,
            added_by: mongoid,
            added_by_type: userType
        })

        await newDailyUpdate.save()

        return res.status(201).json({ message: "Daily Update Added Successfully", success: true })
    } catch (error) {
        next(error)
    }
}

export const getAllDailyUpdatesbyBranch = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req

        if (userType !== 'Customer') {
            return res.status(404).json({ message: "You are Not Autherized to Access this data" })
        }

        const customer = await CUSTOMER.findById(mongoid)

        if (!customer) {
            return res.status(404).json({ message: "Customer Not Found.", success: false })
        }

        const branch = customer.branch

        const dailyUpdate = await DAILYUPDATE.find({ pgcode, branch }).populate('branch').sort({ createdAt: -1 })

        return res.status(200).json({ message: "Getting Daily-update by Customer Successfully. ", data: dailyUpdate, success: true })

    } catch (error) {
        next(error)
    }
}

export const getAllDailyUpdate = async (req, res, next) => {
    try {
        const { pgcode, userType, mongoid } = req
        const { branch } = req.query

        let filter = {}

        filter.pgcode = pgcode

        if (userType === 'Account') {
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

        const dailyData = await DAILYUPDATE.find(filter).populate('branch').sort({ createdAt: -1 })

        return res.status(200).json({ message: "Getting DailyUpdate successfully.", data: dailyData, success: true })

    } catch (error) {
        next(error)
    }
}