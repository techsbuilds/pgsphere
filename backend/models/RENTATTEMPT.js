import mongoose from "mongoose";

const rentAttemptSchema = new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer',
        required:true
    },
    amount:{
        type:Number,
        required:true,
        min:[0,'Rent amount cannot be negative']
    },
    payment_proof:{
       type:String,
    },
    rent_amount:{
        type:Number,        
        required:true,
        default:0,
        min:[0,'Rent amount cannot be negative']
    },
    other_charges:{
        type:Number,
        default:0,
        min:[0,'Other charges cannot be negative']
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
    }
})

export default mongoose.model('Rentattempt',rentAttemptSchema)