import mongoose from 'mongoose'

const branchSchema = new mongoose.Schema({
  branch_image: {
    type: String
  },
  branch_name: {
    type: String,
    required: true
  },
  branch_address: {
    type: String,
    required: true
  },
  pgcode: {
    type: String,
    required: true,             // enforce PG reference
    ref: 'Loginmapping'         // pgcode lives in Loginmapping
  },
  added_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { timestamps: true })

export default mongoose.model('Branch', branchSchema)