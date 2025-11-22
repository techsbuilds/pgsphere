import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { billSchema } from '../validations/billSchema';

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

import { getAllBranch } from '../services/branchService';
import { createMonthlyBill, updateMonthlyBill } from '../services/monthlyBillService';

function MonthlyBillForm({monthlyBill,onClose}) {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState([])
  const [selectedBranch,setSelectedBranch] = useState('')
  
  // Get first day of current month for min date
  const getFirstDayOfCurrentMonth = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    return `${year}-${String(month).padStart(2, '0')}-01`
  }

  const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(billSchema),
    defaultValues: {
        payment_name:'',
        notes:"",
        branch:'',
        starting_date:getFirstDayOfCurrentMonth()
    }
  })

  useEffect(()=>{
    if(monthlyBill){
        reset({
            payment_name:monthlyBill.billName,
            notes:monthlyBill.notes,
            branch:monthlyBill.branch._id,
            starting_date:monthlyBill.startingDate ? new Date(monthlyBill.startingDate).toISOString().split("T")[0] : getFirstDayOfCurrentMonth()
        })
        setSelectedBranch(monthlyBill.branch._id)
    }
  },[])

  const handleGetAllBranch = async ()=>{
    try{
      const data = await getAllBranch()
      setBranches(data)
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }
  }

   useEffect(()=>{
     handleGetAllBranch()
   },[])

   const handleAddMonthlyBill = async (billData) =>{
    setLoading(true)
    try{
        const response = await createMonthlyBill(billData)
        onClose(true)
        toast.success("New monthly bill added successfully.")
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoading(false)
    }
   }

   const handleEditMonthlyBill = async (billData) =>{
    setLoading(true)
    try{
        const response = await updateMonthlyBill(billData, monthlyBill?.billId)
        onClose(true)
        toast.success("Monthly bill details updated successfully.")
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoading(false)
    }
   }

  
  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto'>
        <div className='flex w-full max-w-xl flex-col gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 sm:p-6 my-auto'>
           <div className="flex items-center gap-2">
             <ChevronLeft size={24} onClick={()=>onClose(false)} className="cursor-pointer sm:w-7 sm:h-7"></ChevronLeft>
             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{monthlyBill ? "Edit Monthly Bill" : "Add Monthly Bill"}</h1>
           </div>
           <form onSubmit={handleSubmit(monthlyBill ? handleEditMonthlyBill : handleAddMonthlyBill)} className='flex flex-col gap-3 sm:gap-4'>
             <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Bill Name <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                    <input 
                    {...register('payment_name')}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                    placeholder='Enter bill name'
                    type='text'>
                    </input>
                    {errors.payment_name && <span className='text-xs sm:text-sm text-red-500'>{errors.payment_name.message}</span>}
                </div>
             </div>
             <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Branch <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                    <select 
                    {...register("branch")}
                    onChange={(e)=>setSelectedBranch(e.target.value)}
                    value={selectedBranch}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                    >
                        <option value={''}>-- Select Branch --</option>
                        {
                          branches.map((item,index) => (
                            <option key={index} value={item._id}>{item.branch_name}</option>
                          ))
                        }
                    </select>
                    {errors.branch && <span className='text-xs sm:text-sm text-red-500'>{errors.branch.message}</span>}
                </div>
             </div>
             <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Starting Date <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                    <input 
                    disabled={monthlyBill}
                    {...register('starting_date', {valueAsDate: true})}
                    min={getFirstDayOfCurrentMonth()}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border disabled:cursor-no-drop disabled:bg-gray-100 disabled:text-gray-400 border-neutral-300 rounded-md outline-none'
                    type='date'>
                    </input>
                    {errors.starting_date && <span className='text-xs sm:text-sm text-red-500'>{errors.starting_date.message}</span>}
                    <span className='text-xs text-gray-500 mt-1'>Select the 1st day of the month (e.g., 01-05-2025)</span>
                </div>
             </div>
             <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Notes </label>
                <div className='flex flex-col'>
                    <textarea 
                    {...register('notes')}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none resize-none'
                    placeholder='Enter notes (optional)'
                    rows={4}>
                    </textarea>
                </div>
             </div>
             <div className='flex justify-center items-center pt-2'>
             <button type="submit" disabled={loading} className="p-2.5 sm:p-3 hover:bg-primary/90 w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white text-sm sm:text-base font-medium">
                {
                  loading ? 
                  <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6"></LoaderCircle> :
                  monthlyBill ? "Save" 
                  : "Submit"
                }
             </button>
             </div>
           </form>
        </div>
    </div>
  )
}

export default MonthlyBillForm