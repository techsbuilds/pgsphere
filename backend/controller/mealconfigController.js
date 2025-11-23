import mongoose from "mongoose"
import ACCOUNT from "../models/ACCOUNT.js"
import MEALCONFIG from "../models/MEALCONFIG.js"
import { convertTo24Hour } from "../utils/gethour.js"

export const createMealConfig = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req
        const { breakfast_time, lunch_time, dinner_time } = req.body

        const existingConfig = await MEALCONFIG.findOne({ pgcode })

        if (existingConfig) {
            return res.status(400).json({ message: "Meal Config Already Exists", success: false })
        }

        if (!breakfast_time || !lunch_time || !dinner_time) {
            return res.status(400).json({ message: "All Meal Times are Required", success: false })
        }

        let mealconfig = new MEALCONFIG({
            breakfast_time,
            lunch_time,
            dinner_time,
            pgcode,
            added_by: mongoid,
            added_by_type: userType
        })

        await mealconfig.save()

        return res.status(201).json({ message: "Meal Config Created Successfully", success: true })

    } catch (error) {
        next(error)
    }
}

export const getMealConfig = async (req, res, next) => {
    try {
        const { pgcode, mongoid, userType } = req

        if (userType === "Account") {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Account Manager Not Found", success: false })
            }
        }

        const mealconfig = await MEALCONFIG.findOne({ pgcode })

        if (!mealconfig) {
            return res.status(404).json({ message: "Meal Config Not Found", success: false })
        }

        return res.status(200).json({ message: "Getting Meal Config Successfully", data: mealconfig, success: true })
    } catch (error) {
        next(error)
    }
}

export const updateMealConfig = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { mealconfig_id } = req.params
        const { pgcode, mongoid, userType } = req
        const { breakfast_time, lunch_time, dinner_time } = req.body

        if (!mealconfig_id) {
            return res.status(400).json({ message: "Meal Config ID is Required", success: false })
        }

        let mealconfig = await MEALCONFIG.findOne({ _id: mealconfig_id, pgcode }).session(session)

        if (!mealconfig) {

            await session.abortTransaction()
            session.endSession()

            return res.status(404).json({ message: "Meal Config Not Found", success: false })
        }

        if (breakfast_time && breakfast_time !== mealconfig.breakfast_time) {
            mealconfig.breakfast_time = breakfast_time
        }

        if (lunch_time && lunch_time !== mealconfig.lunch_time) {
            mealconfig.lunch_time = lunch_time
        }

        if (dinner_time && dinner_time !== mealconfig.dinner_time) {
            mealconfig.dinner_time = dinner_time
        }

        await mealconfig.save({ session })

        await session.commitTransaction();
        session.endSession()

        return res.status(200).json({ message: "Meal Config Updated Successfully", success: true })

    } catch (error) {

        await session.abortTransaction();
        session.endSession();

        next(error)
    }
}

export const getMealConfigForCustomer = async (req, res, next) => {
    try {
        const { mongoid, pgcode } = req

        const mealconfig = await MEALCONFIG.findOne({ pgcode })

        if (!mealconfig) {
            return res.status(404).json({ message: "Meal Config Not Found", success: false })
        }

        return res.status(200).json({ message: "Getting Meal Config Successfully", data: mealconfig, success: true })
    } catch (error) {
        next(error)
    }
}