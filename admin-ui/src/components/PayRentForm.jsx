import React, { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { getShortMonthName } from '../helper'
import { zodResolver } from "@hookform/resolvers/zod";
import { payRentSchema } from '../validations/payRentSchema';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { getAllBankAccount } from '../services/bankAccountService';
import { LoaderCircle } from 'lucide-react';
import { createTransactionForCustomerPay } from '../services/transactionService';

function PayRentForm({openForm, onClose, rentDetails, customerId}) {
   const [loading,setLoading] = useState(false)  
   const [isDeposite,setIsDeposite] = useState(false)
   const [isSettled,setIsSettled] = useState(false)
   const [bankAccount,setBankAccount] = useState([])
   
   useEffect(()=>{
    const handleGetBankAccounts = async () =>{
        try{
            const data = await getAllBankAccount()
            setBankAccount(data)
        }catch(err){
            console.log(err)
            toast.error(err?.message)
        }
    }
    handleGetBankAccounts()
   },[])

   const handleMarkAsDeposite = () =>{
      if(isDeposite){
        setIsDeposite(false)
      }else{
        setIsDeposite(true)
        setIsSettled(false)
      }
   }

   const handleMarkAsSettled = () =>{
      if(isSettled){
        setIsSettled(false)
      }else{
        setIsSettled(true)
        setIsDeposite(false)
      }
   }

   const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(payRentSchema),
    defaultValues: {
        amount:0,
        isDeposite:false,
        isSettled:false,
        payment_mode:'',
        bank_account:''
    }
  })

  if(openForm === false) return null

  const handlePay = async (formData) =>{
     try{
      setLoading(true)
      let customerRentData = {
        ...formData,
        isSkip:false,
        customer:customerId,
        month:rentDetails.month,
        year:rentDetails.year,
      }
      const data = await createTransactionForCustomerPay(customerRentData)
      handleClose(true)
      toast.success("Rent Paid Successfully")
     }catch(err){
      console.log(err)
      toast.error(err?.message)
     }finally{
      setLoading(false)
     }
  }

  const handleClose = (refresh = false) =>{
    reset({
      amount:0,
      isDeposite:false,
      isSettled:false,
      payment_mode:'',
      bank_account:''
    })
    setIsDeposite(false)
    setIsSettled(false)
    onClose(refresh)
  }

  console.log(errors)

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-3 sm:p-4'>
        <div className='flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto'>
           <div className="flex items-center gap-2 mb-1 sm:mb-2">
             <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer flex-shrink-0" onClick={()=>handleClose(false)}></ChevronLeft>
             <h1 className="text-base sm:text-lg lg:text-xl font-semibold leading-tight">Collect Rent of {getShortMonthName(rentDetails?.month)} {rentDetails.year}</h1>
           </div>
           <div className='grid grid-cols-2 items-center gap-2 sm:gap-4'>
                <div className='flex p-2 border border-neutral-200 rounded-md items-center gap-2 text-xs sm:text-sm'>
                    <span>Rent Amount:</span>
                    <span className='font-medium'>₹{rentDetails.rent_amount}</span>
                </div>
                <div className='flex items-center gap-2 border border-neutral-200 rounded-md p-2 text-xs sm:text-sm'>
                    <span>Pending Amount</span>
                    <span className='font-medium'>₹{rentDetails.pending}</span>
                </div>
           </div>
           <div className='flex items-start sm:items-center gap-3 sm:gap-4'>
             <div className='flex items-center gap-2'>
                <input 
                id='deposite' 
                checked={isDeposite}
                {...register("isDeposite")}
                onChange={handleMarkAsDeposite} 
                type='checkbox'
                className='w-4 h-4 sm:w-5 sm:h-5'></input>
                <label htmlFor='deposite' className='text-sm sm:text-base cursor-pointer'>Deposite</label>
             </div>
             <div className='flex items-center gap-2'>
                <input 
                id='settled' 
                checked={isSettled} 
                {...register("isSettled")}
                onChange={handleMarkAsSettled} 
                type='checkbox'
                className='w-4 h-4 sm:w-5 sm:h-5'></input>
                <label htmlFor='settled' className='text-sm sm:text-base cursor-pointer'>Settled</label>
             </div>
           </div>
           <form onSubmit={handleSubmit(handlePay)} className='flex flex-col gap-3 sm:gap-4'>
             {
               !isDeposite &&
               <div className='flex mb-2 flex-col gap-3 sm:gap-4'>
               <div className='flex flex-col gap-2'>
                  <label className='text-sm sm:text-base'>Amount <span className='text-xs sm:text-sm text-red-500'>*</span></label>
                  <div className='flex flex-col'>
                      <input
                      type='number'
                      {...register("amount",{ valueAsNumber: true })}
                      className="p-2 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                      placeholder='Enter amount'
                      ></input>
                      {errors.amount && <span className='text-xs sm:text-sm text-red-500'>{errors.amount.message}</span>}
                  </div>
               </div>
               <div className='grid grid-cols-1 sm:grid-cols-2 items-center gap-3 sm:gap-4'>
                  <div className='flex flex-col gap-2'>
                      <label className='text-sm sm:text-base'>Bank Account <span className='text-xs sm:text-sm text-red-500'>*</span></label>
                      <div className='flex flex-col'>
                          <select
                          {...register("bank_account")}
                          className='p-2 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                          >
                            <option value={''}>-- Select Bank Account --</option>
                            {
                                bankAccount.map((account,index)=>(
                                    <option key={index} value={account._id}>{`${account.account_holdername}`}</option>
                                ))
                            }
                          </select>
                          {errors.bank_account && <span className='text-xs sm:text-sm text-red-500'>{errors.bank_account.message}</span>}
                      </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                      <label className='text-sm sm:text-base'>Payment Mode <span className='text-xs sm:text-sm text-red-500'>*</span></label>
                      <div className='flex flex-col'>
                          <select
                          {...register("payment_mode")}
                          className='p-2 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                          >
                            <option value={''}>-- Select Payment Mode --</option>
                            <option value={'cash'}>Cash</option>
                            <option value={'upi'}>UPI</option>
                            <option value={'bank_transfer'}>Bank Transfer</option>
                          </select>
                          {errors.payment_mode && <span className='text-xs sm:text-sm text-red-500'>{errors.payment_mode.message}</span>}
                      </div>
                  </div>
               </div>
               {errors.general_error && <span className='text-xs sm:text-sm text-red-500'> {errors.general_error.message}</span>}
               </div>
             }
             <div className="flex justify-end gap-2 items-stretch sm:items-center">
                 <button onClick={()=>handleClose(false)} className='p-2 hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm w-32 cursor-pointer flex justify-center items-center rounded-md border border-neutral-300'>
                    Cancel
                 </button>
                 <button type="submit" disabled={loading} className="p-2 w-32 text-xs sm:text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white font-medium">
                  {
                    loading ? 
                    <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></LoaderCircle> :
                    isDeposite ? "Mark as Deposite" : isSettled ? "Mark as Settled" :
                    "Collect"
                  }
                 </button>
               </div>
           </form>
        </div>
    </div>
  )
}

export default PayRentForm