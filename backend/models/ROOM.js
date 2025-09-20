import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    room_id:{
        type:String,
        required:true,
        trim:true
    },
    room_type:{
        type:String,
        required:true,
        enum : ['Hall','Room']
    },
    floor_id : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Floor',
        required:true
    },
    service_type:{
        type:String,
        required:true,
        enum : ['AC','Non-AC']
    },
    capacity:{
        type:Number,
        required:true,
        min: [1, 'Capacity must be at least 1'],
    },
    filled:{
        type:Number,
        required:true,
        default:0,
        min: [0, 'Filled cannot be negative'],
    },
    remark:{
        type:String,
        trim:true
    },
    branch:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Branch',
        required:true
    },
    added_by:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:'added_by_type',
        required:true
    },
    added_by_type:{
        type:String,
        enum:['Admin','Account'],
        required:true
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
},{timestamps:true})


export default mongoose.model('Room',roomSchema)