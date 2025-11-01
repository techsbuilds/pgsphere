import CASHOUT from "../models/CASHOUT.js";
import CUSTOMER from "../models/CUSTOMER.js";
import CUSTOMERRENT from "../models/CUSTOMERRENT.js";
import EMPLOYEE from "../models/EMPLOYEE.js";
import EMPLOYEESALARY from "../models/EMPLOYEESALARY.js";
import INVENTORYPURCHASE from "../models/INVENTORYPURCHASE.js";
import MONTHLYPAYMENT from "../models/MONTHLYPAYMENT.js";
import MONTHLYPAYMENTRECEIPT from "../models/MONTHLYPAYMENTRECEIPT.js";
import TRANSACTION from "../models/TRANSACTION.js";
import ACCOUNT from "../models/ACCOUNT.js"
import RENTATTEMPT from "../models/RENTATTEMPT.js";
import DEPOSITEAMOUNT from "../models/DEPOSITEAMOUNT.js";

export const createTransactionForCustomerRent = async (req, res, next) =>{
   try{
     const {pgcode, userType, mongoid} = req  
     const {amount, payment_mode, customer, bank_account, month, year, isDeposite, isSettled, isSkip} = req.body 

     if(isDeposite===undefined || isSettled===undefined || isSkip===undefined || !customer || !month || !year){
       return res.status(400).json({message:"Please provide all required fields.",success:false})
     }

     if(!isSkip && !isSettled && !isDeposite){
        if(!amount || !payment_mode || !bank_account || !month || !year) return res.status(400).json({message:"Please provide all required fields.",success:false})
     }

     const existCustomer = await CUSTOMER.findById(customer)

     if(!existCustomer) return res.status(404).json({message:"Customer not found.",success:false})

     if(userType === "Account"){
         const account = await ACCOUNT.findOne(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(existCustomer.branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this customer.",success:false})
         }
     }

     const customerRent = await CUSTOMERRENT.findOne({month,year,customer})

     if(!customerRent) return res.status(404).json({message:"Customer rent is not found.",success:false})

     if(customerRent.status === 'Paid') return res.status(400).json({message:"Customer rent is already paid.",success:false})

     //For Skip Rent
     if(isSkip){
       customerRent.skipped = true;
       customerRent.status = 'Paid';
       await customerRent.save()

       return res.status(200).json({message:"Customer rent skipped successfully.",success:true})
     }

     //For Deposite
     if(isDeposite){
      customerRent.is_deposite = true 
      customerRent.status = 'Paid'
      await customerRent.save() 

      return res.status(200).json({message:"Customer rent marked as desposite successfully.",success:true})
     }

     if(amount < 0) return res.status(400).json({message:"amount value is invalid.",success:false})

     if(month < 1 || month > 12) return res.status(400).json({message:"Month value is invalid.",success:false})

     //For setteled rent
     if(isSettled){
      customerRent.setteled = true 
      customerRent.paid_amount += amount 
      customerRent.status = 'Paid'

      const newRentAttempt = await RENTATTEMPT({
         customer,
         amount,
         rent_amount:amount,
         month,
         year
      })

      const newTransaction = await TRANSACTION({
         transactionType:'income',
         type:'rent_attempt',
         refModel:'Rentattempt',
         refId:newRentAttempt,
         payment_mode,
         status:'completed',
         branch:existCustomer.branch,
         pgcode,
         bank_account,
         added_by:mongoid,
         added_by_type:userType
      })

      await newRentAttempt.save()
      await newTransaction.save()
      await customerRent.save() 

      return res.status(200).json({message:"Customer rent marked as setteled successfully.",success:true})

     }

     //For general rent payment
     if((customerRent.paid_amount + amount) > customerRent.rent_amount){
         return res.status(400).json({message:"Paid amount exceeds the rent amount.",success:false})
     }

     customerRent.paid_amount += amount
     if(customerRent.paid_amount === customerRent.rent_amount){
         customerRent.status = 'Paid'
     }

     const newRentAttempt = new RENTATTEMPT({
         customer,
         amount,
         rent_amount:amount,
         month,
         year
     })

     const newTransaction = new TRANSACTION({
        transactionType:'income',
        type:'rent_attempt',
        refModel:'Rentattempt',
        refId:newRentAttempt,
        payment_mode,
        status:'completed',
        branch:existCustomer.branch,
        pgcode,
        bank_account,
        added_by:mongoid,
        added_by_type:userType
     })

     await newRentAttempt.save()
     await newTransaction.save()
     await customerRent.save()

     return res.status(200).json({message:"New transaction created successfully.",success:true,data:newTransaction})
     
   }catch(err){
     next(err)
   }
}

export const createTransactionForDepositeAmount = async (req, res, next) =>{
   try{
      const {mongoid, userType, pgcode} = req 

      const {customer, amount, bank_account, payment_mode} = req.body

      if(!customer || !amount || !bank_account || !payment_mode) return res.status(400).json({message:"Please provide all required fields.",success:false})

      const existCustomer = await CUSTOMER.findById(customer)

      if(!existCustomer) return res.status(404).json({message:"Customer not found.",success:false})

      if(userType === "Account"){
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(existCustomer.branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this customer.",success:false})
         }
      }

      if(amount < 0) return res.status(400).json({message:"amount value is invalid.",success:false})

      if((existCustomer.paid_deposite_amount + amount) > existCustomer.deposite_amount){
         return res.status(400).json({message:"Deposite amount exceeds the customer's deposite amount.",success:false})
      }

      const newDepositeAmount = new DEPOSITEAMOUNT({
         customer,
         amount
      })

      const newTransaction = new TRANSACTION({
         transactionType:'deposite',
         type:'deposite',
         refModel:'Depositeamount',
         refId:newDepositeAmount._id,
         payment_mode,
         status:'completed',
         branch:existCustomer.branch,
         pgcode,
         bank_account,
         added_by:mongoid,
         added_by_type:userType
      })

      if(existCustomer.paid_deposite_amount + amount === existCustomer.deposite_amount){
         existCustomer.deposite_status = 'Paid'
         await existCustomer.save()
      }

      existCustomer.paid_deposite_amount += amount

      await newDepositeAmount.save()
      await newTransaction.save()
      await existCustomer.save()

      return res.status(200).json({message:"New transaction created for deposite amount.",success:true,data:newTransaction})

   }catch(err){
      next(err)
   }
} 

export const createTransactionForExtraCharge  = async (req, res, next) =>{
   try{
      const {mongoid, userType, pgcode} = req

      const {customer, name, amount, month, year, bank_account, payment_mode} = req.body 

      if(!customer || !name || !amount || !month || !year || !bank_account || !payment_mode) return res.status(400).json({message:"Please provide all required fields.",success:false})

      const existCustomer = await CUSTOMER.findById(customer)

      if(!existCustomer) return res.status(404).json({message:"Customer not found.",success:false})

      if(userType === "Account"){   
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(existCustomer.branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this customer.",success:false})
         }
      }

      const customerRent = await CUSTOMERRENT.findOne({customer, month, year})

      if(!customerRent) return res.status(404).json({message:"Customer rent not found."})

      if(amount < 0) return res.status(400).json({message:"amount value is invalid.",success:false})

      if(month < 1 || month > 12) return res.status(400).json({message:"Month value is invalid.",success:false})

      const newRentAttempt = new RENTATTEMPT({
         customer,
         amount,
         other_charges:amount,
         month,
         year,
      })

      const newTransaction = new TRANSACTION({
         transactionType:'income',
         type:'rent_attempt',
         refModel:'Rentattempt',
         refId:newRentAttempt,
         payment_mode,
         status:'completed',
         branch:existCustomer.branch,
         pgcode,
         bank_account,
         added_by:mongoid,
         added_by_type:userType
      })

      customerRent.extraChargeSchemas.push({name, amount})

      await customerRent.save()

      return res.status(200).json({message:"New extra charge added successfully.",success:true,data:newTransaction})

   }catch(err){
      next(err)
   }
}

export const createTransactionForRentByCustomer = async (req, res, next) =>{
   try{
      const {mongoid, pgcode} = req 

      const {amount, payment_mode, month, year, bank_account} = req.body 

      if(!amount || !payment_mode || !bank_account || !month || !year) return res.status(400).json({message:"Please provide all required fields.",success:false})

      if(payment_mode === 'bank_transfer' || payment_mode === 'upi'){
         if(!req.file){
            return res.status(400).json({message:"Please provide payment proof.",success:false})
         }
      }

      const existCustomer = await CUSTOMER.findById(mongoid)

      if(!existCustomer) return res.status(404).json({message:"Customer not found.",success:false})

      let payment_proof = ''
      if(req.file){
         payment_proof = `${process.env.DOMAIN}/uploads/paymentproof/${req.file.filename}`
      }

      const newRentAttempt = await RENTATTEMPT({  
         customer:mongoid,
         amount,
         rent_amount:amount,
         payment_proof,
         month,
         year 
      })

      const transaction = await TRANSACTION({
         transactionType:'income',
         type:'rent_attempt',
         refModel:'Rentattempt',
         refId:newRentAttempt,
         payment_mode,
         status:'pending',
         branch:existCustomer.branch,
         pgcode,
         bank_account,
         added_by:mongoid,
         added_by_type:'Customer'
      })

      await newRentAttempt.save();
      await transaction.save();

      return res.status(200).json({message:"Rent request sended successfully.",success:true, data:transaction})

   }catch(err){
      next(err)
   }
}

export const verifyCustomerTransaction = async (req, res, next) =>{
   try{
      const {mongoid, userType, pgcode} = req 

      const {transactionId, status} = req.body
      if(!transactionId || !status) return res.status(400).json({message:"Please provide all required fields.",success:false})

      if(!['completed','rejected'].includes(status)){ 
         return res.status(400).json({message:"Invalid status value.",success:false})
      }

      const transaction = await TRANSACTION.findOne({_id:transactionId, pgcode, added_by_type:'Customer'}).populate('refId') 

      if(!transaction) return res.status(400).json({message:"Transaction not found.",success:false})

      if(userType==="Account"){  
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(transaction.branch.toString())){
            return res.status(403).json({message:"You are not authorized to verify transaction for this branch.",success:false})
         }
      }

      const customerRent = await CUSTOMERRENT.findOne({
         customer:transaction.refId.customer,
         month:transaction.refId.month,
         year:transaction.refId.year
      })

      if(!customerRent) return res.status(404).json({message:"Customer rent not found.",success:false})

      if(status==='rejected'){
         transaction.status = 'rejected'
         await transaction.save() 

         return res.status(200).json({message:"Customer transaction rejected successfully.",success:true})
      }

      if(customerRent.status === 'Paid'){
         return res.status(400).json({message:"Customer rent is already paid.",success:false})
      }

      let pendingAmount = customerRent.rent_amount - customerRent.paid_amount

      if(transaction.refId.amount > pendingAmount){
         return res.status(400).json({message:"Transaction amount exceeds the pending rent amount.",success:false})
      }  

      customerRent.paid_amount += transaction.refId.amount
      if(customerRent.paid_amount === customerRent.rent_amount){
         customerRent.status = 'Paid'
      }

      transaction.status = status
      await customerRent.save()
      await transaction.save()

      return res.status(200).json({message:"Transaction verified successfully.",success:true,data:transaction})

   }catch(err){
      next(err)
   }
}


export const createTransactionForEmployeeSalary = async (req, res, next) =>{
   try{
      const {amount, payment_mode, employee, year, bank_account, month} = req.body
      const {mongoid, userType, pgcode} = req

      if(!amount || !payment_mode || !bank_account || !employee || !year || !month){
          return res.status(400).json({message:"Please provide required fields.",success:false})
      }

      const existEmployee = await EMPLOYEE.findById(employee)

      if(!existEmployee) return res.status(404).json({message:"Employee is not found.",success:false})

      if(userType === "Account"){
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(existEmployee.branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this employee.",success:false})
         }
      }

      if(amount < 0) return res.status(400).json({message:"Invalid amount value.",success:false})

      if(month < 1 || month > 12) return res.status(400).json({message:"Invalid month value",success:false})

      const newEmployeeSalaryRecipt = new EMPLOYEESALARY({
         employee,
         amount,
         month,
         year
      })

      await newEmployeeSalaryRecipt.save()

      const newTransaction = new TRANSACTION({
         transactionType:'expense',
         type:'employee_salary',
         refModel:'Employeesalary',
         refId:newEmployeeSalaryRecipt,
         payment_mode,
         branch:existEmployee.branch,
         bank_account,
         pgcode
      })

      await newTransaction.save()

      return res.status(200).json({message:"New Transaction created for employee salary.",success:true, data:newTransaction})

   }catch(err){
      next(err)
   }
}

export const createTransactionForInventory = async (req, res, next) =>{
   try{
      const {pgcode, userType, mongoid} = req
      const {amount, payment_mode, branch, item_name, bank_account, item_type } = req.body
      
      if(!amount || !payment_mode || !bank_account || !branch || !item_name || !item_type){
         return res.status(400).json({message:"Please provide all required fields.",success:false})
      }

      if(userType === "Account"){
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this branch.",success:false})
         }
      }

      if(amount < 0) return res.status(400).json({message:"amount value is invalid.",success:false})

      const newInventoryPurchaseRecipt = new INVENTORYPURCHASE({
         item_name,
         item_type,
         amount
      })

      await newInventoryPurchaseRecipt.save()

      const newTransaction = new TRANSACTION({
         transactionType:'expense',
         type:'inventory_purchase',
         refModel:'Inventorypurch',
         refId:newInventoryPurchaseRecipt,
         payment_mode,
         branch,
         bank_account,
         pgcode
      })

      await newTransaction.save()

      return res.status(200).json({message:"New transaction created for inventory.",success:true,data:newTransaction})

   }catch(err){
      next(err)
   }
}

export const createTransactionForMonthlyPayment = async (req, res, next) =>{
   try{
     const {userType, mongoid, pgcode} = req
     const {monthlypayment, amount, month, year, payment_mode, bank_account} = req.body

     if(!monthlypayment || !month || !year || !bank_account) return res.status(400).json({message:"Please provide all required fields.",success:false})

     const existMonthlyPayment = await MONTHLYPAYMENT.findById(monthlypayment)

     if(!existMonthlyPayment) return res.status(404).json({message:"Monthly payment is not found.",success:false})

     if(userType === "Account"){
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account not found.",success:false})

         if(!account.branch.includes(existMonthlyPayment.branch.toString())){
            return res.status(403).json({message:"You are not authorized to create transaction for this monthly payment.",success:false})
         }
     }

     const {payment_name, branch} = existMonthlyPayment

     const newMonthlyPaymentReceipt = new MONTHLYPAYMENTRECEIPT({
        monthly_payment:monthlypayment,
        payment_name,
        amount,
        month,
        year
     })

     await newMonthlyPaymentReceipt.save()

     const newTransaction = new TRANSACTION({
       transactionType:'expense',
       type:'monthly_bill',
       refModel:'Monthlypaymentreceipt',
       refId:newMonthlyPaymentReceipt,
       payment_mode,
       branch,
       bank_account,
       pgcode
     })

     await newTransaction.save()

     return res.status(200).json({message:"New transaction created successfully.",success:true,data:newTransaction})
     
   }catch(err){
     next(err)
   }
} 


export const createTransactionForCashout = async (req, res, next) =>{
   try{
      const {pgcode} = req
      const {amount, person_name , payment_mode, bank_account, notes, mobile_no, transactionType} = req.body

      if(!amount || !person_name || !payment_mode || !bank_account || !transactionType) return res.status(400).json({message:"Please provide required fields.",success:false})

      if(amount < 0) return res.status(400).json({message:"Invalid amount type.",success:false})
      
      const newCashOut = new CASHOUT({
         person_name,
         mobile_no,
         amount,
         notes
      })
      
      await newCashOut.save()

      const newTransaction = new TRANSACTION({
         transactionType,
         type:'cash_given',
         refModel:'Cashout',
         refId:newCashOut,
         payment_mode,
         bank_account,
         pgcode
      })

      await newTransaction.save()

      return res.status(200).json({message:"New transaction created successfully.",success:true,data:newTransaction})


   }catch(err){
      next(err)
   }
}


export const getAllTransactions = async (req, res, next) =>{
   try{
      const {pgcode, userType, mongoid} = req
      const {branch, bank_account ,transactionType} = req.query
        
      let filter = {
         pgcode
      }

      if(userType === "Account"){
         const account = await ACCOUNT.findById(mongoid)

         if(!account) return res.status(404).json({message:"Account manager not found.",success:false})

         if(branch){
            if(!account.branch.includes(branch.toString())){
               return res.status(403).json({message:"You are not authorized to access transactions for this branch.",success:false})
            }else{
               filter.branch = branch
            }
         }else{
            filter.branch = {$in: account.branch}
         }
      }else{
         if(branch){
            filter.branch = branch
         }
      }

      if(bank_account) {
         filter.bank_account = bank_account
      }

      if(transactionType) {
         filter.type = transactionType
      }

      const transactions = await TRANSACTION.find(filter).
      populate("refId").
      populate('branch').
      populate('bank_account')

      return res.status(200).json({message:"All transaction retrived successfully.",success:true,data:transactions})

   }catch(err){
      next(err)
   }
}