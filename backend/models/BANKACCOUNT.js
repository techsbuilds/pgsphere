import mongoose from 'mongoose'


const bankAccountSchema = new mongoose.Schema({
    account_holdername:{
        type:String,
        required:true
    },
    pgcode:{
        type:String,
        required:true,
        ref:'Loginmapping'
    },
    status: {
        type:String,
        enum:['active','deleted'],
        default:'active'
    },
    is_default:{
        type:Boolean,
        default:false
    },
},{timestamps:true})

export default mongoose.model('Bankaccount',bankAccountSchema)