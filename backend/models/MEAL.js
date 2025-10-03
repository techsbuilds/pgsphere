// date meals : [{ items:[],type:[enum:['Breakfast', ‘Lunch', 'Dinner’]], description, cancelled:[{type:Ref to customer id}] }]

import mongoose from "mongoose";

export const mealSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Date Is Required'],
        default: Date.now()
    },
    meals: [{
        items: [{
            type: String,
            required: true
        }],
        type: {
            type: String,
            enum: ['Breakfast', 'Lunch', 'Dinner'],
            required: [true, 'type is Required']
        },
        description: {
            type: String
        },

        cancelled: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
        }]
    }],
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    branch: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'added_by_type',
        required: true
    },
    added_by_type: {
        type: String,
        enum: ['Admin', 'Account'],
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Meal', mealSchema)