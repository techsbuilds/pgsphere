import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, 'Email is required.'],
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          'Please fill a valid email address'
        ]
    },
    otp:{
        type:String,
        required:[true, 'OTP is required.']
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:'180'
    }
});

export default mongoose.model('Otp',otpSchema);
