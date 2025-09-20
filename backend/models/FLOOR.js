import mongoose from "mongoose"

const floorSchema = new mongoose.Schema({
    floor_name:{
        type:String,
        required:true,
        trim:true
    },
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch',
        required:true
    },
    pgcode: {
        type: String,
        required: true,
        ref: 'Loginmapping'
    },
},{timestamps:true})


export default mongoose.model('Floor',floorSchema)