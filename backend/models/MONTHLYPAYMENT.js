import mongoose from "mongoose";


const monthlyPaySchema = new mongoose.Schema({
    payment_name:{
        type:String,
        required:true
    },
    notes:{
        type:String
    },
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch'
    },
    starting_date:{
        type: Date,
        default: () => new Date()
    },
    pgcode:{
        type:String,
        required:true,
        ref:'Loginmapping'
    }
},{timestamps:true})


export default mongoose.model('Monthlypayment',monthlyPaySchema)


