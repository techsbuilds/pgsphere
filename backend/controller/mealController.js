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
            return res.status(400).json({ message: "Please Provide Valid Meal , meal in Array.", success: false })
        }

        if (!Array.isArray(branch)) {
            branch = [branch]
        }

        console.log("Acmanger-id:", mongoid)

        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmagaer Not Found !", success: false })
            }

            console.log("Acmanager Branch: ", acmanager.branch)

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
        const { date, type } = req.body

        if (userType === 'Customer') {
            const customer = await CUSTOMER.findById(mongoid)

            if (!customer) {
                return res.status(400).json({ message: "You are Not Autherized to Chnage Meal Status", success: false })
            }
            const branch = customer.branch

            const mealDetails = await MEAL.findOne({ pgcode, branch, date,"meals.type": type })

            if (!mealDetails) {
                return res.status(404).json({ message: "Meal Not Found !", success: false })
            }

            mealDetails.meals.cancelled.push(mongoid)

            mealDetails.save()

            return res.status(200).json({ message: "Meal Cancelled Successfully.", success: true, })

        } else {
            return res.status(400).json({ message: "Sorry , You are Not Autherized to Change the Meal Status !", success: false })
        }

    } catch (error) {
        next(error)
    }
}

export const getMealDetailsbyWeekly = async (req, res, next) => {
    try {

        console.log("In Weekly-Meal details")

        const { pgcode, userType, mongoid } = req
        let { branch } = req.params

        if (!branch) {
            return res.status(400).json({ message: "Please Provide Branch !", success: false })
        }

        let filter = {}

        filter.pgcode = pgcode

        if (!Array.isArray(branch)) {
            branch = [branch]
        }

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        const today = new Date()
        const dayOfWeek = today.getDay() // Sunday=0, Monday=1, ...

        // Get Monday of this week
        let monday = new Date(today)
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        monday.setHours(0, 0, 0, 0)

        // Get Sunday of this week
        let sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        sunday.setHours(23, 59, 59, 999)

        if (userType === 'Account') {

            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmagaer Not Found!", success: false })
            }

            const isAuthorized = branch.every((br) => acmanager.branch.includes(br));

            if (!isAuthorized) {
                return res.status(400).json({ message: "You are Not Autherized to Add Meals in this Branch!", success: false })
            }

            filter.branch = branch

        }
        if (userType === 'Customer') {
           const customer = await CUSTOMER.findById(mongoid)

            if (!customer) {
                return res.status(404).json({ message: "Customer Not Found !", success: false })
            }

            filter.branch = customer.branch
        }
        if (userType === 'Admin') {
            filter.branch = branch
        }

        const weeklyMealsRaw = await MEAL.find({
            ...filter,
            date: { $gte: monday, $lte: sunday }
        }).populate('branch')

        let weeklyMeals = {
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": []
        }

        // Fill meals till today
        weeklyMealsRaw.forEach(meal => {
            const mealDay = days[new Date(meal.date).getDay()]
            // Only add meals if day <= today
            const mealDayIndex = days.indexOf(mealDay)
            if (
                (dayOfWeek === 0 && mealDayIndex <= 6) || // Sunday case
                (mealDayIndex > 0 && mealDayIndex <= dayOfWeek)
            ) {
                weeklyMeals[mealDay].push(meal)
            }
        })

        return res.status(200).json({ message: "Get Meals Details Successfully.", meal: weeklyMeals, success: true })

    } catch (error) {
        next(error)
    }
}
export const getMealDetailsbyDay = async (req, res, next) => {
    try {

        const { mongoid, userType, pgcode } = req
        const { date, branch } = req.params

        if (!date || !branch) {
            return res.status(400).json({ message: "Please Provide All Required Fields.", success: false })
        }

        let filter = {}
        filter.pgcode = pgcode

        const parsedDate = new Date(date.split("-").reverse().join("-"));

        filter.date = parsedDate

        if (userType === 'Customer') {
            const customer = await CUSTOMER.findOne({ _id: mongoid,status: true })

            if (!customer) {
                return res.status(404).json({ message: "Customer Not Found !", success: false })
            }

            filter.branch = customer.branch
        }
        if (userType === 'Account') {

            const acmanager = await ACCOUNT.findById(mongoid)

            if (!acmanager) {
                return res.status(404).json({ message: "Acmanager Not Found !", success: false })
            }

            if (!acmanager.branch.includes(branch)) {
                return res.status(400).json({ message: "You are Not Autherized to view Meal in This Branch",success:false })
            }

            filter.branch = branch
        }
        if (userType === 'Admin') {
            filter.branch = branch
        }

        const mealsDetails = await MEAL.find(filter)

        return res.status(200).json({ message: "Get Meal Successfully by Day.", meal: mealsDetails, success: true })

    } catch (error) {
        next(error)
    }
}