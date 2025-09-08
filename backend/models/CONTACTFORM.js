import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Required"]
    },
    email: {
        type: String,
        required: [true, "Email is Required"],
        trim: true,
        lowercase : true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          'Please fill a valid email address'
        ]
    },
    mobile_no: {
        type: String,
        required: [true, "Mobile Number is Required"],
        match: [
            /^(?:\+91[-\s]?)?[6-9]\d{9}$/,
            'Mobile number must be valid and can optionally start with +91'
        ],
        trim: true
    },
    message:{
        type : String,
    }
},{timestamps:true});

export default mongoose.model('Contact',ContactSchema)
