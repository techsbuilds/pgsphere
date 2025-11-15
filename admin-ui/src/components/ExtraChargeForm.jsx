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
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center'>
        <div className='flex w-xl flex-col gap-4 bg-white rounded-2xl p-4'>
           <div className="flex items-center gap-2 mb-2">
             <ChevronLeft size={28} onClick={()=>onClose(false)} className="cursor-pointer"></ChevronLeft>
             <h1 className="text-2xl font-semibold">Add Extra Charges</h1>
           </div>
           <form onSubmit={handleSubmit(handleAddExtraCharge)} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                    <label>Charge Name <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                        <input
                        {...register("name")}
                        type='text'
                        className="p-2 border border-neutral-300 rounded-md outline-none"
                        placeholder='Enter charge name'
                        ></input>
                        {errors.name && <span className='text-sm text-red-500'>{errors.name.message}</span>}
                    </div>
              </div>
              <div className='flex flex-col gap-2'>
                    <label>Amount <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                        <input
                        {...register("amount", { valueAsNumber: true })}
                        type='number'
                        className="p-2 border border-neutral-300 rounded-md outline-none"
                        placeholder='Enter amount'
                        ></input>
                        {errors.amount && <span className='text-sm text-red-500'>{errors.amount.message}</span>}
                    </div>
              </div>
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
              <div className='flex justify-end items-center gap-4'>
                    <button onClick={()=>onClose(false)} type='button' className='p-2 px-6 rounded-md border border-gray-400'>Cancel</button>
                    <button disabled={loading} type='submit' className='p-2 w-36 px-6 rounded-md text-white bg-primary hover:bg-blue-600 transition-all duration-300'>
                        {loading ? <LoaderCircle className="animate-spin mx-auto"></LoaderCircle> : "Add Charge"}
                    </button>
              </div>
           </form>
        </div>
    </div>
  )
}

export default ExtraChargeForm