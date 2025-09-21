import ACCOUNT from "../models/ACCOUNT.js"
import BRANCH from "../models/BRANCH.js"
import CUSTOMER from "../models/CUSTOMER.js"
import MEAL from "../models/MEAL.js"


export const addMeal = async (req, res, next) => {
    try {

        const { mongoid, userType, pgcode } = req

        let { date, meals, branch } = req.body

        if (!date || !meals || !branch) {
            return res.status(400).json({ message: "Please Provide All Requires Fields.", success: false })
        }

        if (!Array.isArray(meals)) {
            return res.status(400).json({ message: "Please Provide Valid Meal.", success: false })
        }

        if (!Array.isArray(branch)) {
            branch = [branch]
        }

        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findOne({ _id: mongoid, pgcode })

            if (!acmanager) {
                return res.status(404).json({ message: "Acmagaer Not Found!", success: false })
            }

            const isAuthorized = branch.every((br) => acmanager.branch.includes(br));

            if (!isAuthorized) {
                return res.status(400).json({ message: "You are Not Autherized to Add Meals in this Branch!", success: false })
            }


        }

        const meal = MEAL({
            date,
            meals,
            pgcode,
            branch,
            added_by: mongoid,
            added_by_type: userType
        })

        await meal.save()

        return res.status(201).json({ message: "Meal Created Successfully.", success: true })

    } catch (error) {
        next(error)
    }
}

export const updateStatusByCustomer = async (req, res, next) => {
    try {
        const { mongoid, pgcode, userType } = req

        if (userType === 'Customer') {
            const customer = await CUSTOMER.findOne({ _id: mongoid, pgcode, status: true })

            if (!customer) {
                return res.status(400).json({ message: "You are Not Autherized to Chnage Meal Status", success: false })
            }
            const branch = customer.branch

            const mealDetails = await MEAL.findOne({ pgcode, branch })

            if (!mealDetails) {
                return res.status(404).json({ message: "Meal Not Found !", success: false })
            }

            mealDetails.meals.cancelled.push(mongoid)
            mealDetails.save()
        } else {    
            return res.status(400).json({ message: "Sorry , You are Not Autherized to Change the Meal Status !", success: false })
        }

    } catch (error) {
        next(error)
    }
}

export const getMealDetails = async (req, res, next) => {
    try {

        const { pgcode, userType, mongoid } = req
        const { branch } = req.params

        let filter = {}

        filter.pgcode = pgcode

        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findOne({ _id: mongoid, pgcode })

            if (!acmanager) {
                return res.status(404).json({ message: "Acmagaer Not Found!", success: false })
            }

            const isAuthorized = branch.every((br) => acmanager.branch.includes(br));

            if (isAuthorized) {
                return res.status(400).json({ message: "You are Not Autherized to Add Meals in this Branch!", success: false })
            }
            const branches = acmanager.branch
            filter.branch = { $in: branches }


        }
        if (userType === 'Customer') {
            const customer = await CUSTOMER.findOne({ _id: mongoid, pgcode, branch, status: true })

            if (!customer) {
                return res.status(404).json({ message: "Customer Not Found !", success: false })
            }

            filter.branch = customer.branch
        }

        const mealDetails = await MEAL.find(filter).populate('branch')

        return res.status(200).json({ message: "Get Meals Details Successfully.", meal: mealDetails, success: true })

    } catch (error) {
        next(error)
    }
}