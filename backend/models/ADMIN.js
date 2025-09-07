import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    full_name:{
        type:String,
        required:[true, 'Full name is required.']
    },
    email:{
        type: String,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          'Please fill a valid email address'
        ],
        required:true
    },
    pg_name:{
        type:String,
        required:[true, 'PG name is required.']
    },
    address:{
        type:String,
        required:[true, 'Address is required.']
    },
    contactno:{
        type:String,
        required:[true, 'Contact number is required.'],
        match: [/^\d{10}$/, 'Please fill a valid 10-digit contact number']
    },
    pglogo:{
        type:String,
    }
},{timestamps:true})

export default mongoose.model('Admin',adminSchema)