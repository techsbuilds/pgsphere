import mongoose from "mongoose";

const depositeAmountSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:[0,'Deposit amount cannot be negative']
    }
},{timestamps:true})

export default mongoose.model('Depositeamount',depositeAmountSchema)