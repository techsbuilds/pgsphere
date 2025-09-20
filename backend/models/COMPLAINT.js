import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({

    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Food Quality", "Maintenance", "Staff Behaviour", "Room Issue"]
    },
    status: {
        type: String,
        enum: ["Opne", "Close"],
        default: "Open",
        required: true
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Branch"
    },
    close_by:{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'close_by_type',  
    },
    close_by_type:{
        type:String,
        enum:['Admin','Account']
    }
    
}, { timestamps: true })

export default mongoose.model('Complaint', complaintSchema)