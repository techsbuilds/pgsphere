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
      onClose(true)
      toast.success("Rent Paid Successfully")
     }catch(err){
      console.log(err)
      toast.error(err?.message)
     }finally{
      setLoading(false)
     }
  }

  console.log(errors)

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center'>
        <div className='flex w-xl flex-col gap-4 bg-white rounded-2xl p-4'>
           <div className="flex items-center gap-2 mb-2">
             <ChevronLeft size={28} onClick={()=>onClose(false)} className="cursor-pointer"></ChevronLeft>
             <h1 className="text-2xl font-semibold">Pay Rent of {getShortMonthName(rentDetails?.month)} {rentDetails.year}</h1>
           </div>
           <div className='grid grid-cols-2 items-center gap-4'>
                <div className='flex p-2 border border-neutral-200 rounded-md items-center gap-2'>
                    <span>Rent Amount:</span>
                    <span className='font-medium'>₹{rentDetails.rent_amount}</span>
                </div>
                <div className='flex items-center gap-2 border border-neutral-200 rounded-md p-2'>
                    <span>Pending Amount</span>
                    <span className='font-medium'>₹{rentDetails.pending}</span>
                </div>
           </div>
           <div className='flex items-center gap-4'>
             <div className='flex items-center gap-2'>
                <input 
                id='deposite' 
                checked={isDeposite}
                {...register("isDeposite")}
                onChange={handleMarkAsDeposite} 
                type='checkbox'></input>
                <label htmlFor='deposite'>Deposite</label>
             </div>
             <div className='flex items-center gap-2'>
                <input 
                id='settled' 
                checked={isSettled} 
                {...register("isSettled")}
                onChange={handleMarkAsSettled} 
                type='checkbox'></input>
                <label htmlFor='settled'>Settled</label>
             </div>
           </div>
           <form onSubmit={handleSubmit(handlePay)} className='flex flex-col gap-4'>
             {
               !isDeposite &&
               <div className='flex mb-2 flex-col gap-4'>
               <div className='flex flex-col gap-2'>
                  <label>Amount <span className='text-sm text-red-500'>*</span></label>
                  <div className='flex flex-col'>
                      <input
                      type='number'
                      {...register("amount",{ valueAsNumber: true })}
                      className="p-2 border border-neutral-300 rounded-md outline-none"
                      placeholder='Enter amount'
                      ></input>
                      {errors.amount && <span className='text-sm text-red-500'>{errors.amount.message}</span>}
                  </div>
               </div>
               <div className='grid grid-cols-2 items-center gap-4'>
                  <div className='flex flex-col gap-2'>
                      <label>Bank Account <span className='text-sm text-red-500'>*</span></label>
                      <div className='flex flex-col'>
                          <select
                          {...register("bank_account")}
                          className='p-2 border border-neutral-300 rounded-md outline-none'
                          >
                            <option value={''}>-- Select Bank Account --</option>
                            {
                                bankAccount.map((account,index)=>(
                                    <option key={index} value={account._id}>{`${account.account_holdername}`}</option>
                                ))
                            }
                          </select>
                          {errors.bank_account && <span className='text-sm text-red-500'>{errors.bank_account.message}</span>}
                      </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                      <label>Payment Mode <span className='text-sm text-red-500'>*</span></label>
                      <div className='flex flex-col'>
                          <select
                          {...register("payment_mode")}
                          className='p-2 border border-neutral-300 rounded-md outline-none'
                          >
                            <option value={''}>-- Select Payment Mode --</option>
                            <option value={'cash'}>Cash</option>
                            <option value={'upi'}>UPI</option>
                            <option value={'bank_transfer'}>Bank Transfer</option>
                          </select>
                          {errors.payment_mode && <span className='text-sm text-red-500'>{errors.payment_mode.message}</span>}
                      </div>
                  </div>
               </div>
               {errors.general_error && <span className='text-sm text-red-500'> {errors.general_error.message}</span>}
               </div>
             }
             <div className="flex justify-end gap-2 items-center">
                 <button onClick={()=>onClose(false)} className='p-2 hover:bg-gray-100 transition-all duration-300 text-sm w-32 cursor-pointer flex justify-center items-center rounded-md border border-neutral-300'>
                    Cancel
                 </button>
                 <button type="submit" disabled={loading} className="p-2 min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white font-medium">
                  {
                    loading ? 
                    <LoaderCircle className="animate-spin"></LoaderCircle> :
                    isDeposite ? "Mark as Deposite" : isSettled ? "Mark as Settled" :
                    "Pay"
                  }
                 </button>
               </div>
           </form>
        </div>
    </div>
  )
}

export default PayRentForm