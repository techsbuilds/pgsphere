import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
    transactionType: {
       type:String,
       enum:['expense','income']
    },
    type: {
        type: String,
        enum: ['rent_attempt','deposite', 'employee_salary', 'monthly_bill', 'inventory_purchase', 'cash_given'],
        required: true
    },
    refModel:{
        type:String,
        required:true
    },
    refId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        refPath:'refModel'
    },
    payment_mode:{
        type:String,
        enum:['cash','upi','bank_transfer'],
        default:'cash'
    },
    status:{    
        type:String,
        enum:['pending','completed','rejected'],
        default:'completed'
    },
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch'
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    bank_account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bankaccount',
    },
    added_by:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:'added_by_type',
        required:true
    },
    added_by_type:{
        type:String,
        enum:['Admin','Account','Customer']
    }
},{timestamps:true})

export default mongoose.model('Transaction',transactionSchema)