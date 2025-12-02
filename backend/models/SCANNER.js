import mongoose from "mongoose";

const scannerSchema = new mongoose.Schema({
    sc_image: {
        type: String,
        required: [true, 'Please Provide Scanner Image']
    },
    bankaccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bankaccount',
        required: true
    },
    pgcode: {
        type: String,
        required: true,             // enforce PG reference
        ref: 'Loginmapping'         // pgcode lives in Loginmapping
    },
    branch: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Branch'
    }],
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    },
    added_by: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'added_by_type',
        required: true
    },
    added_by_type: {
        type: String,
        enum: ['Admin', 'Account'],
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Scanner',scannerSchema)