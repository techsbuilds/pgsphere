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
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch',

    },
    month:Number,
    year:Number,
    
},{timestamps:true})

export default mongoose.model('Customerrent',customerrentSchema)