import ACCOUNT from "../models/ACCOUNT.js"
import BRANCH from "../models/BRANCH.js"
import CUSTOMER from "../models/CUSTOMER.js"
import MEAL from "../models/MEAL.js"
import moment from "moment/moment.js"
import MEALCONFIG from "../models/MEALCONFIG.js"
import mongoose from "mongoose"
import DAILYUPDATE from "../models/DAILYUPDATE.js"
import { convertTo24Hour } from "../utils/gethour.js"

export const addMeal = async (req, res, next) => {
    try {

        const { mongoid, userType, pgcode } = req

        let { date, meals, branch } = req.body

        if (!date || !meals || !branch) {
            return res.status(400).json({ message: "Please Provide All Requires Fields.", success: false })
        }

        const parsedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM/DD/YYYY"], true);

        if (parsedDate.isValid()) {
            // Convert to standard format
            date = parsedDate.format("YYYY-MM-DD");
        } else {
            // If invalid, fallback to today
            date = moment().format("YYYY-MM-DD");
        }

        const today = moment().startOf("day");
        const selectedDate = moment(date, "YYYY-MM-DD");

        if (selectedDate.isBefore(today)) {
            return res.status(400).json({
                message: "Meal cannot be created for a past date.",
                success: false
            });
        }

        if (!Array.isArray(meals)) {
            return res.status(400).json({ message: "Please Provide Valid Meal , meal in Array.", success: false })
        }

        if (!Array.isArray(branch)) {
            branch = [branch]
        }

        const isexist = await MEAL.findOne({ date, pgcode, branch: { $in: branch } })

        if (isexist) {
            return res.status(400).json({ message: "Meal Already Exist for this Branch on this Date", success: false })
        }

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
        let { date, type } = req.body

        const now = new Date()

        let currentHours = now.getHours()
        const currentmitune = now.getMinutes()

        currentHours = currentHours + currentmitune / 60

        const currentDate = now.toISOString().split('T')[0]

        if (userType === 'Customer') {
            const customer = await CUSTOMER.findById(mongoid)

            if (!customer) {
                return res.status(400).json({ message: "You are Not Autherized to Chnage Meal Status", success: false })
            }

            if (!date) {
                date = moment().format("YYYY-MM-DD");
            } else {
                // Try parsing in multiple formats
                const parsedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM/DD/YYYY"], true);

                if (parsedDate.isValid()) {
                    // Convert to standard format
                    date = parsedDate.format("YYYY-MM-DD");
                } else {
                    // If invalid, fallback to today
                    date = moment().format("YYYY-MM-DD");
                }
            }

            if (date > currentDate) {
                console.log("ohk")
            }

            else if (date === currentDate) {

                const mealconfig = await MEALCONFIG.findOne({ pgcode })

                if (!mealconfig) {
                    return res.status(404).json({ message: "Meal Config Not Found ", success: false })
                }

                const breakfastHour = convertTo24Hour(mealconfig.breakfast_time)
                const lunchHour = convertTo24Hour(mealconfig.lunch_time)
                const dinnerHour = convertTo24Hour(mealconfig.dinner_time)

                if (type === "Breakfast" && currentHours >= breakfastHour) {
                    return res.status(400).json({ message: `You can't Cancel Breakfast After ${breakfastHour}`, success: false })
                }
                if (type === "Lunch" && currentHours >= lunchHour) {
                    return res.status(400).json({ message: `You can't Cancel Lunch After ${lunchHour}`, success: false })
                }
                if (type === "Dinner" && currentHours >= dinnerHour) {
                    return res.status(400).json({ message: `You can't Cancel Dinner After ${dinnerHour}`, success: false })
                }
            } else {
                return res.status(400).json({ message: "You can't Cancel Meal for Past", success: false })
            }

            const branch = customer.branch

            let mealDetails = await MEAL.findOne({ pgcode, branch, date, "meals.type": type })

            if (!mealDetails) {
                return res.status(404).json({ message: "Meal Not Found !", success: false })
            }

            const mealObj = mealDetails.meals.find(m => m.type === type);
            if (!mealObj) {
                return res.status(404).json({ message: "Meal Type Not Found!", success: false });
            }

            if (!mealObj.cancelled.includes(mongoid)) {
                mealObj.cancelled.push(mongoid);
            }

            await mealDetails.save()

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

        const { pgcode, userType, mongoid } = req
        let { branch } = req.params

        if (userType !== "Customer") {

            if (!branch) {
                return res.status(400).json({ message: "Please Provide Branch !", success: false })
            }

            if (!Array.isArray(branch)) {
                branch = [branch]
            }
        }

        let filter = {}

        filter.pgcode = pgcode

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

        if (!date) {
            return res.status(400).json({ message: "Please Provide Date ", success: false })
        }

        if (userType !== "Customer") {

            if (!branch) {
                return res.status(400).json({ message: "please provide Branch.", success: false })
            }

        }

        let filter = {}
        filter.pgcode = pgcode

        if (!date) {
            filter.date = moment().format("YYYY-MM-DD");
        } else {
            // Try parsing in multiple formats
            const parsedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM/DD/YYYY"], true);

            if (parsedDate.isValid()) {
                // Convert to standard format
                filter.date = parsedDate.format("YYYY-MM-DD");
            } else {
                // If invalid, fallback to today
                filter.date = moment().format("YYYY-MM-DD");
            }
        }

        if (userType === 'Customer') {
            const customer = await CUSTOMER.findById(mongoid)

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
                return res.status(400).json({ message: "You are Not Autherized to view Meal in This Branch", success: false })
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

export const updateMeal = async (req, res, next) => {

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const { mongoid, userType, pgcode } = req
        let { mealid, date } = req.params
        let { meals, branch } = req.body

        if (!mealid || !date) {
            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ message: "Please Provide All Required Fields !", success: false })
        }

        const parsedDate = moment(date, ["YYYY-MM-DD", "DD-MM-YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM/DD/YYYY"], true);

        if (parsedDate.isValid()) {
            // Convert to standard format
            date = parsedDate.format("YYYY-MM-DD");
        } else {

            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({ message: "Please Provide Valid Date !", success: false })
        }

        const today = moment().startOf("day");
        const selectedDate = moment(date, "YYYY-MM-DD");

        if (selectedDate.isBefore(today)) {

            await session.abortTransaction()
            session.endSession()
            return res.status(400).json({message: "You can't Update Past Meal.",success: false});
        }

        if (userType === "Account") {
            const acmanager = await ACCOUNT.findById(mongoid).session(session)

            if (!acmanager) {

                await session.abortTransaction()
                session.endSession()
                return res.status(404).json({ message: "Acmanager Not Found !", success: false })
            }

            const branches = acmanager.branch

            isAuthorized = branch.every((br) => branches.includes(br))

            if (!isAuthorized) {

                await session.abortTransaction()
                session.endSession()
                return res.status(400).json({ message: "You are Not Autherized to Update Meal in this Branch", success: false })
            }
        }
        let meal = await MEAL.findOne({ _id: mealid, date, pgcode }).session(session)

        if (!meal) {

            await session.abortTransaction()
            session.endSession()
            return res.status(404).json({ message: "Meal Not Found !", success: false })
        }

        const dailyUpdateBranch = meal.branch

        if (meals) {
            if (!Array.isArray(meals)) {
                meals = [meals]
            }

            meal.meals = meals
        }

        if (branch) {

            if (!Array.isArray(branch)) {
                branch = [branch]
            }

            meal.branch = branch
        }

        await meal.save({ session })

        const dailyUpdate = new DAILYUPDATE({
            title: "Meal Updated",
            content_type: "General",
            pgcode,
            branch: dailyUpdateBranch,
            added_by: mongoid,
            added_by_type: userType
        })

        await dailyUpdate.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({ message: `Meal Updated Successfully for ${date}`, success: true })
    } catch (error) {

        await session.abortTransaction()
        session.endSession()
        next(error)
    }
}

export const getMealDetailsbyMonthly = async (req, res, next) => {
    try {
        const { pgcode, userType, mongoid } = req;
        let { branch } = req.params;

        let filter = {};
        filter.pgcode = pgcode;

        const today = new Date();

        // Create date range
        let startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 15);
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 15);
        endDate.setHours(23, 59, 59, 999);

        // Branch authorization
        if (userType === 'Account') {
            const acmanager = await ACCOUNT.findById(mongoid);

            if (!acmanager) {
                return res.status(404).json({
                    message: "Account manager not found!",
                    success: false
                });
            }

            const isAuthorized = branch.every(br =>
                acmanager.branch.includes(br)
            );

            if (!isAuthorized) {
                return res.status(400).json({
                    message: "You are not authorized to access meals for this branch!",
                    success: false
                });
            }

            filter.branch = branch;
        }

        if (userType === 'Admin') {
            filter.branch = branch;
        }

        // ✅ Total customers in branch
        const totalCustomer = await CUSTOMER.find({ branch }).countDocuments();

        // ✅ Fetch meals in the 30-day window
        const mealsRaw = await MEAL.find({
            ...filter,
            date: { $gte: startDate, $lte: endDate }
        })
            .populate('branch')
            .populate({
                path: "meals.cancelled",
                model: "Customer",
                select: "_id customer_name"
            })
            .lean();

        // ✅ Create date → { meals: [], counts:{...} }
        let mealByDate = {};

        let loopDate = new Date(startDate);
        while (loopDate <= endDate) {
            const key = loopDate.toISOString().split("T")[0];

            mealByDate[key] = {
                meals: [],
                counts: {
                    breakfast: 0,
                    lunch: 0,
                    dinner: 0
                }
            };

            loopDate.setDate(loopDate.getDate() + 1);
        }

        // ✅ Put meals in mealByDate[date].meals
        mealsRaw.forEach(meal => {
            const key = new Date(meal.date).toISOString().split("T")[0];
            if (mealByDate[key]) {
                mealByDate[key].meals.push(meal);
            }
        });

        // ✅ Calculate per-day counts (merged inside mealByDate)
        Object.keys(mealByDate).forEach(dateKey => {
            mealByDate[dateKey].meals.forEach(mealDoc => {
                mealDoc.meals.forEach(m => {
                    const cancelledCount = m.cancelled?.length || 0;

                    if (m.type === "Breakfast") {
                        mealByDate[dateKey].counts.breakfast = totalCustomer - cancelledCount;
                    }
                    if (m.type === "Lunch") {
                        mealByDate[dateKey].counts.lunch = totalCustomer - cancelledCount;
                    }
                    if (m.type === "Dinner") {
                        mealByDate[dateKey].counts.dinner = totalCustomer - cancelledCount;
                    }
                });
            });
        });

        return res.status(200).json({
            message: "Meals fetched successfully.",
            mealByDate,
            totalCustomer,
            success: true
        });

    } catch (error) {
        next(error);
    }
};
