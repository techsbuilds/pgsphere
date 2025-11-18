import React, { useState, useEffect } from 'react'
import { getAllBankAccount } from '../services/bankAccountService'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { extraChargeSchema } from '../validations/extraChargeForm';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';

//Import icons
import { ChevronLeft } from 'lucide-react'
import { createTransactionForExtraCharge } from '../services/transactionService';

function ExtraChargeForm({openForm, onClose, rentDetails, customerId}) {
  const [bankAccount,setBankAccount] = useState([])
  const [loading, setLoading] = useState(false)

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

   const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(extraChargeSchema),
    defaultValues: {
        name:'',
        amount:0,
        payment_mode:'',
        bank_account:''
    }
  })

  const handleAddExtraCharge = async (formData) =>{
    setLoading(true)
     try{
        let obj = {
            ...formData,
            customer: customerId,
            month: rentDetails.month,
            year: rentDetails.year,
        }
        const data = await createTransactionForExtraCharge(obj)
        toast.success("Extra charge added successfully.")
        onClose(true)
     }catch(err){
        console.log(err)
        toast.error(err?.message)
     }finally{
        setLoading(false)
     }
  }

  if(!openForm) return null  
    
  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-3 sm:p-4'>
        <div className='flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto'>
           <div className="flex items-center gap-2 mb-1 sm:mb-2">
             <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer flex-shrink-0" onClick={()=>onClose(false)}></ChevronLeft>
             <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Add Extra Charges</h1>
           </div>
           <form onSubmit={handleSubmit(handleAddExtraCharge)} className='flex flex-col gap-3 sm:gap-4'>
              <div className='flex flex-col gap-2'>
                    <label className='text-sm sm:text-base'>Charge Name <span className='text-xs sm:text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                        <input
                        {...register("name")}
                        type='text'
                        className="p-2 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                        placeholder='Enter charge name'
                        ></input>
                        {errors.name && <span className='text-xs sm:text-sm text-red-500'>{errors.name.message}</span>}
                    </div>
              </div>
              <div className='flex flex-col gap-2'>
                    <label className='text-sm sm:text-base'>Amount <span className='text-xs sm:text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                        <input
                        {...register("amount", { valueAsNumber: true })}
                        type='number'
                        className="p-2 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                        placeholder='Enter amount'
                        ></input>
                        {errors.amount && <span className='text-xs sm:text-sm text-red-500'>{errors.amount.message}</span>}
                    </div>
              </div>
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
              <div className='flex justify-end items-stretch sm:items-center gap-2 sm:gap-4'>
                    <button onClick={()=>onClose(false)} type='button' className='p-2 hover:bg-gray-100 transition-all duration-300 text-xs sm:text-sm w-full sm:w-auto sm:px-6 rounded-md border border-gray-400 cursor-pointer flex justify-center items-center'>Cancel</button>
                    <button disabled={loading} type='submit' className='p-2 w-full sm:w-36 sm:px-6 text-xs sm:text-sm rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer flex justify-center items-center font-medium'>
                        {loading ? <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></LoaderCircle> : "Add Charge"}
                    </button>
              </div>
           </form>
        </div>
    </div>
  )
}

export default ExtraChargeForm