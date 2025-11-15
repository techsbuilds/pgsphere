import { getMonthYearList } from "../helper.js";
import ACCOUNT from "../models/ACCOUNT.js";
import MONTHLYPAYMENT from "../models/MONTHLYPAYMENT.js";
import TRANSACTION from "../models/TRANSACTION.js";

export const createMonthlyPayment = async (req, res, next) =>{
    try{
        const {pgcode} = req
        const {payment_name, notes, starting_date, branch} = req.body

        if(!payment_name || !branch || !starting_date) return res.status(400).json({message:"Please provide all required fields.",success:false})

        const newMonthlyPayment = new MONTHLYPAYMENT({
            payment_name,
            notes,
            starting_date,
            branch,
            pgcode
        })

        await newMonthlyPayment.save()

        return res.status(200).json({message:"New monthly payment created.",success:true, data:newMonthlyPayment})

    }catch(err){
        next(err)
    }
}

export const getMonthlyPaymentsList = async (req, res, next)=>{
   try{
     const {searchQuery, branch} = req.query 
     const {pgcode, userType, mongoid} = req 

     let filter = {
        pgcode
     }

     if(searchQuery) {
        filter.payment_name = { $regex: searchQuery, $options: 'i'}
     }

     if(userType === "Account"){
        const account = await ACCOUNT.findById(mongoid)

        if(!account) return res.status(404).json({message:"Account manager is not found.",success:false})

        if(branch){
           if(!account.branch.includes(branch)) return res.status(403).json({message:"You have not access to get monthly payment of this branch.",success:false})

            filter.branch = branch
              
        }else{
            filter.branch = { $in: account.branch }
        }
     }else{
        if(branch) filter.branch = branch
     }

     const monthlyPayments = await MONTHLYPAYMENT.find(filter).populate('branch')

     const responseData = [];

     // Get current month and year
     const today = new Date();
     const currentMonth = today.getMonth() + 1;
     const currentYear = today.getFullYear();

     for(const bill of monthlyPayments){
        // Get all months from starting_date to current month
        const allMonths = getMonthYearList(bill.starting_date)

        // Find all transactions for this monthly payment
        const monthlyTransaction = await TRANSACTION.find({
            transactionType:'expense',
            type:'monthly_bill',
            refModel:'Monthlypaymentreceipt',
            branch:bill.branch._id,
            pgcode
        }).populate({
            path:'refId',
            model:'Monthlypaymentreceipt',
            match: {monthly_payment:bill._id}
        })

        // Create a set of months that have transactions (paid months)
        const paidMonthsSet = new Set();

        for (const tx of monthlyTransaction){
            const entry = tx.refId 
            if(!entry) continue;

            const key = `${entry.month}-${entry.year}`;
            paidMonthsSet.add(key);
        }

        // Find pending months (months without transactions, only up to current month)
        const pendingMonths = [];

        for(const {month, year} of allMonths) {
            // Only include months up to current month (don't show future months)
            if(year > currentYear || (year === currentYear && month > currentMonth)) {
                break;
            }

            const key = `${month}-${year}`;
            
            // If no transaction exists for this month, it's pending
            if(!paidMonthsSet.has(key)){
                const isRequired = !(month === currentMonth && year === currentYear)

                pendingMonths.push({
                    month, 
                    year,
                    required: isRequired
                })
            }
        }

        responseData.push({
            billId: bill._id,
            billName: bill.payment_name,
            notes:bill.notes,
            startingDate:bill.starting_date,
            pendingMonths: pendingMonths,
            branch:bill.branch
        })

     } 

     return res.status(200).json({message:"All monthly payment retrived successfully.",success:true,data:responseData})


   }catch(err){
     next(err)
   }
}

export const updateMonthlyPaymentDetails = async (req, res, next) =>{
     try{
        const {pgcode} = req
        const {billId} = req.params 

        const {payment_name, notes, branch} = req.body 

        if(!billId) return res.status(400).json({message:"Please provide bill id.",success:false})

        const bill = await MONTHLYPAYMENT.findOne({_id:billId, pgcode}) 

        if(!bill) return res.status(404).json({message:"Monthly bill is not found.",success:false}) 

        if(payment_name) {
            bill.payment_name = payment_name 
        }

        if(notes) {
            bill.notes = notes 
        }

        if(branch) {
            bill.branch = branch 
        }

        await bill.save() 

        return res.status(200).json({message:"Bill amount details updated successfully.",success:true,data:bill})

     }catch(err){
        next(err)
     }
}

export const deleteMonthlyBill = async (req, res, next) =>{
    try{
        const {pgcode} = req
        const {billId} = req.params 

        if(!billId) return res.status(400).json({message:"Please provide bill id.",success:false})

        const bill = await MONTHLYPAYMENT.findOne({_id:billId, pgcode})

        if(!bill) return res.status(404).json({message:"Bill is not found.",success:false}) 

        await MONTHLYPAYMENT.findByIdAndDelete(billId) 

        return res.status(200).json({message:"Bill deleted successfully.",success:true})

    }catch(err){
        next(err)
    }
}