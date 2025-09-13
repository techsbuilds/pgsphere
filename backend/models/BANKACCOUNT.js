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
    }
},{timestamps:true})

export default mongoose.model('Bankaccount',bankAccountSchema)