import mongoose from "mongoose";

//title content type [Maintainace, Notice, General] pgcode added_by added_by_type

const dailyUpdateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content_type: {
        type: String,
        required: true,
        enum: ["Maintainace", "Notice", "General"]
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    branch:[{
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
}, { timestamps: true });

export default mongoose.model('DailyUpdate', dailyUpdateSchema)