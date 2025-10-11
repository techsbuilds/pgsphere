import mongoose from "mongoose";

const extraChargeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const customerrentSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer'
    },
    rent_amount:{
        type:Number,        
        required:true,
        min:[0,'Rent amount cannot be negative']
    },
    paid_amount:{
        type:Number,
        required:true,
        default:0,
        min:[0,'Paid amount cannot be negative']
    },
    status:{
        type:String,
        enum:['Paid','Pending'],
        default:'pending'
    },
    setteled:{
        type:Boolean,
        default:false
    },
    skipped:{
        type:Boolean,
        default:false
    },
    is_deposite:{
        type:Boolean,
        default:false
    },
    month:{
        type:Number,
        required:true,
        min:1,
        max:12
    },
    year:{
        type:Number,
        required:true,
    },
    extraChargeSchemas:[extraChargeSchema],
    
},{timestamps:true})

export default mongoose.model('Customerrent',customerrentSchema)