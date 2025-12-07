import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customer_profile_picture:{
    type: String,
    required: true
  },
  customer_name: {
    type: String,
    required: true
  },
  email:{
    type: String,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
          'Please fill a valid email address'
        ]
  },
  mobile_no: {
    type: String,
    match: [
      /^(?:\+91[-\s]?)?[6-9]\d{9}$/,
      'Mobile number must be valid and can optionally start with +91'
    ],
    trim: true,
    required: true
  },
  deposite_amount: {
    type: Number,
    min: [0, 'Deposit amount cannot be negative']
  },
  paid_deposite_amount:{
    type: Number,
    min: [0, 'Paid Deposite amount cannot be negative'],
    default:0
  },
  deposite_status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  rent_amount:{
    type:Number,
    min: [0, 'Rent amount cannot be negative']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Room'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Branch'
  },
  joining_date: {
    type: Date,
    default: () => new Date()
  },
  aadharcard_url:{
    type:String,
    required:true
  },
  aadharcard_back_url:{
    type:String,
    required:true
  },
  emergency_contact_name:{
    type:String,
    required:true
  },
  emergency_contact_mobile_no:{
    type: String,
    match: [
      /^(?:\+91[-\s]?)?[6-9]\d{9}$/,
      'Mobile number must be valid and can optionally start with +91'
    ],
    trim: true,
    required:true
  },
  ref_person_name:{
    type:String,
  },
  ref_person_contact_no:{
    type: String,
    match: [
      /^(?:\+91[-\s]?)?[6-9]\d{9}$/,
      'Mobile number must be valid and can optionally start with +91'
    ],
    trim: true,
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
  }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
