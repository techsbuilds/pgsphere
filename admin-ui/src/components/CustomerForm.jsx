import React, {useEffect, useState}  from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema } from '../validations/customerSchema';
import { useForm } from "react-hook-form";
import UploadImage from './UploadImage';

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { getAllBranch } from '../services/branchService';
import { getRoomByBranchId } from '../services/roomService';
import { createCustomer, updateCustomer } from '../services/customerService';
import { getAllBankAccount } from '../services/bankAccountService';


function CustomerForm({selectedCustomer, onClose}) {
  const [loading,setLoading] = useState(false)
  const [branches,setBranches] = useState([])
  const [rooms,setRooms] = useState([])
  const [selectedBranch,setSelectedBranch] = useState('')
  const [selectedRoom,setSelectedRoom] = useState('')
  const [file,setFile] = useState(null)
  const [preview,setPreview] = useState(selectedCustomer ? selectedCustomer.aadharcard_url : null)
  const [bankAccounts,setBankAccounts] = useState([])
  const [imageError,setImageError] = useState('')

  console.log('seleced customer',selectedCustomer)

  
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(customerSchema),
    defaultValues: {
       customer_name:'',
       deposite_amount:0,
       variable_deposite_amount:0,
       rent_amount:0,
       mobile_no:'',
       email:'',
       joining_date:new Date().toISOString().split("T")[0],
       branch:'',
       room:'',
       bank_account:'',
       payment_mode:'',
       ref_person_name:'',
       ref_person_contact_no:'',
    }
  })

  useEffect(()=>{
    if(selectedCustomer) {
      reset({
        customer_name:selectedCustomer.customer_name,
        deposite_amount:selectedCustomer.deposite_amount,
        variable_deposite_amount:0,
        email:selectedCustomer.email,
        rent_amount:selectedCustomer.rent_amount,
        mobile_no:selectedCustomer.mobile_no,
        joining_date:new Date(selectedCustomer.joining_date).toISOString().split("T")[0],
        branch:selectedCustomer.branch._id,
        room:selectedCustomer.room._id,
        bank_account:'NONE',
        payment_mode:"NONE",
        ref_person_contact_no:selectedCustomer.ref_person_contact_no || '',
        ref_person_name:selectedCustomer.ref_person_name || '',
      })
      setSelectedBranch(selectedCustomer.branch._id)
      setSelectedRoom(selectedCustomer.room._id)
    }
  },[selectedCustomer])

  const handleGetAllBranch = async ()=>{
      try{
        const data = await getAllBranch()
        setBranches(data)
      }catch(err){
        console.log(err)
        toast.error(err?.message)
      }
  }

  useEffect(()=> {
    const handleGetBankAccounts = async () =>{
       try{
        const data = await getAllBankAccount()
        setBankAccounts(data)
       }catch(err){
        console.log(err)
        toast.error(err?.message)
       }
    }

    handleGetBankAccounts()
  },[])

  useEffect(()=>{
    handleGetAllBranch()
  },[])

  const handleGetRoomsByBranchId = async () =>{
    try{
        const data = await getRoomByBranchId(selectedBranch)
        setRooms(data)
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }
  }
  
  useEffect(()=>{
    if(selectedBranch) handleGetRoomsByBranchId(selectedBranch)
  },[selectedBranch])


  const handleAddCustomer = async (customerData)=>{
    if(!file) {
      setImageError("Please upload aadhar card image.")
      return 
    }else{
      setImageError("")
    }
    setLoading(true)
    try{
       const formData = new FormData()
       formData.append('aadharcard',file)
       for (const [key, value] of Object.entries(customerData)) {
         formData.append(key, value)
       }
       const response = await createCustomer(formData)
       onClose(true)
       toast.success('New customer added successfully.')
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
      setLoading(false)
    }
  }

  const handleEditCustomer = async (customerData) => {
     if(!preview) {
      setImageError("Please upload aadhar card image.")
      return 
     }else{
      setImageError("")
     }
     setLoading(true)
     try{
       const formData = new FormData()
       formData.append('aadharcard',file)
       for (const [key, value] of Object.entries(customerData)) {
        formData.append(key, value)
       }
       const response = await updateCustomer(selectedCustomer._id,formData)
       onClose(true)
       toast.success("Customer details updated successfully.")
     }catch(err){
       console.log(err)
       toast.error(err?.message)
     }finally{
       setLoading(false)
     }
  }

  console.log(errors)

  return (
    <div 
      className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6'
      onClick={() => onClose(false)}
    > 
        <div 
          className='flex w-full max-w-lg md:max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4'
          onClick={(e) => e.stopPropagation()}
        >
           <div className="flex items-center gap-2">
            <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer" onClick={()=>onClose(false)}></ChevronLeft>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">{selectedCustomer ? "Edit Customer" : "Add Customer"}</h1>
           </div>
           <form onSubmit={handleSubmit(selectedCustomer ? handleEditCustomer : handleAddCustomer)} className='flex flex-col gap-3 sm:gap-4'>
             <div className='flex flex-col gap-2'>
               <label>Aadhar Card <span className='text-sm text-red-500'>*</span></label>
               <div className='flex flex-col'>
                 <UploadImage file={file} setFile={setFile} previewImage={preview} setPreviewImage={setPreview}></UploadImage> 
                 {imageError && <span className='text-xs sm:text-sm text-red-500'>{imageError}</span>}
               </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Customer Name <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                 <input 
                 type='text'
                 {...register("customer_name")}
                 className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                 placeholder="Enter customer name"
                 ></input>
                 {errors.customer_name && <span className='text-xs sm:text-sm text-red-500'>{errors.customer_name.message}</span>}
                </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Email <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                  <input 
                  {...register('email')}
                  type='email'
                  className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                  placeholder='Enter email address'
                  ></input>
                  {errors.email && <span className='text-xs sm:text-sm text-red-500'>{errors.email.message}</span>}
                </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Mobile No <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                  <input 
                  type='text'
                  {...register("mobile_no")}
                  className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                  placeholder="Enter mobile no"
                  ></input>
                  {errors.mobile_no && <span className='text-xs sm:text-sm text-red-500'>{errors.mobile_no.message}</span>}
                </div>
             </div>

             <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Rent Amount <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                  <input 
                  type='number'
                  {...register("rent_amount",{ valueAsNumber: true })}
                  className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                  placeholder="Enter rent amount"
                  ></input>
                  {errors.rent_amount && <span className='text-xs sm:text-sm text-red-500'>{errors.rent_amount.message}</span>}
                </div>
              </div>

             <div className='grid grid-cols-2 items-center gap-3 sm:gap-4'>
              <div className={`flex ${selectedCustomer && "col-span-2"}  flex-col gap-1 sm:gap-2`}>
                <label className='text-sm sm:text-base'>Fixed Deposite Amount <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                  <input 
                  type='number'
                  {...register("deposite_amount",{ valueAsNumber: true })}
                  className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                  placeholder="Enter deposite amount"
                  ></input>
                  {errors.deposite_amount && <span className='text-xs sm:text-sm text-red-500'>{errors.deposite_amount.message}</span>}
                </div>
              </div>

             {
                !selectedCustomer && 
                <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Pay Deposite Amount <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                  <input 
                  type='number'
                  {...register("variable_deposite_amount",{ valueAsNumber: true })}
                  className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                  placeholder="Enter deposite amount"
                  ></input>
                  {errors.variable_deposite_amount && <span className='text-xs sm:text-sm text-red-500'>{errors.variable_deposite_amount.message}</span>}
                </div>
                </div>
             }

             </div>
             <div className='grid grid-cols-2 items-center gap-3 sm:gap-4'>
             <div className='flex flex-col gap-1 sm:gap-2'>
                 <label className='text-sm sm:text-base'>Branch <span className='text-sm text-red-500'>*</span></label>
                 <div className='flex flex-col'>
                 <select 
                  {...register("branch",{onChange: (e) => setSelectedBranch(e.target.value)})}
                  value={selectedBranch}
                  className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'>
                     <option value={''}>--- Select Branch ---</option>
                     {
                        branches.map((item,index) => (
                            <option key={index} value={item._id}>{item.branch_name}</option>
                        ))
                     }
                 </select>
                 {errors.branch && <span className='text-xs sm:text-sm text-red-500'>{errors.branch.message}</span>}
                 </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
                 <label className='text-sm sm:text-base'>Room <span className='text-sm text-red-500'>*</span></label>
                 <div className='flex flex-col'>
                 <select 
                  {...register("room", {onChange: (e) => setSelectedRoom(e.target.value)})}
                  value={selectedRoom}
                  className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'>
                     <option value={''}>--- Select Room ---</option>
                     {
                        rooms.map((item,index) => (
                            <option key={index} value={item._id}>{item.room_id}</option>
                        ))
                     }
                 </select>
                 {errors.room && <span className='text-xs sm:text-sm text-red-500'>{errors.room.message}</span>}
                 </div>
             </div>
             </div>
             {
              !selectedCustomer && 
              <div className='grid grid-cols-2 items-center gap-3 sm:gap-4'>
              <div className='flex flex-col gap-1'>
                <label className='text-sm sm:text-base'>Select Bank Account <span className='text-red-500 text-sm'>*</span></label>
                <div className='flex flex-col'>
                   <select 
                   {...register("bank_account")}
                   className='p-2 border border-neutral-300 rounded-md outline-none'>
                     <option value={''}>-- Select Bank Account --</option>
                     {
                       bankAccounts.map((item, index) => (
                        <option value={item._id} key={index}>{item.account_holdername}</option>
                       ))
                     }
                   </select>
                   {errors.bank_account && <span className='text-sm text-red-500'>{errors.bank_account.message}</span>}
                </div>
               </div>
               <div className='flex flex-col gap-2'>
                <label className='text-sm sm:text-base'>Select Payment Mode <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                    <select
                    {...register('payment_mode')}
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
             }

             <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Joining Date <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                <input 
                type='date'
                {...register("joining_date", {valueAsDate: true})}
                className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                ></input>
                {errors.joining_date && <span className='text-xs sm:text-sm text-red-500'>{errors.joining_date.message}</span>}
                </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
               <label className='text-sm sm:text-base'>Referral Person Name</label>
               <div className='flex flex-col'>
                <input
                {...register('ref_person_name')}
                type='text'
                className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                placeholder='Enter refral person name'
                ></input>
               </div>
             </div>
             <div className='flex flex-col gap-1 sm:gap-2'>
               <label className='text-sm sm:text-base'>Referral Person Contactno</label>
               <div className='flex flex-col'>
                <input
                {...register('ref_person_contact_no')}
                type='text'
                className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                placeholder='Enter refral person contact no'
                ></input>
                {errors.ref_person_contact_no && <span className='text-xs sm:text-sm text-red-500'>{errors.ref_person_contact_no.message}</span>}
               </div>
             </div>
             <div className="flex justify-center items-center">
             <button type="submit" disabled={loading} className="p-2 hover:bg-primary/90 w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white font-medium text-sm sm:text-base">
                {
                  loading ? 
                  <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></LoaderCircle> :
                  selectedCustomer ? "Save" 
                  : "Submit"
                }
             </button>
          </div>
           </form>
        </div>
    </div>
  )
}

export default CustomerForm