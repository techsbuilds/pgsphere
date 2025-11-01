import mongoose from "mongoose";

const mealConfigSchema = new mongoose.Schema({
    breakfast_time: {
        type: String,
        required: [true, "Breakfast Time is required"]
    },
    lunch_time: {
        type: String,
        required: [true, "Lunch Time is required"]
    },
    dinner_time: {
        type: String,
        required: [true, "Dinner Time is required"]
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'added_by_type',
        required: true
    },
    added_by_type: {
        type: String,
        enum: ['Admin'],
        required: true
    }
},{timestamps:true})

export default mongoose.model('MealConfig', mealConfigSchema)