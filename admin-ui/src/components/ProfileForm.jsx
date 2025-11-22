import React , {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

//Import icons
import { ChevronLeft, LoaderCircle } from 'lucide-react';

import { profileSchema } from '../validations/profileSchema';

function ProfileForm({userDetails, onClose}) {
  const [loading, setLoading] = useState()  
  
  const {
    register,
    handleSubmit,
    formState: {errors},
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(profileSchema),
    defaultValues: {
       full_name:userDetails.full_name,
       email:userDetails.email
    }
  })

  const handleEditProfileDetails = async () =>{
    setLoading(true)
    try{
    
    }catch(err){

    }finally{
      setLoading(false)
    }
  }

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto'>
        <div className='flex w-full max-w-xl flex-col gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 sm:p-6 my-auto'>
          <div className='flex items-center gap-2'>
              <ChevronLeft size={24} onClick={()=>onClose(false)} className="cursor-pointer sm:w-7 sm:h-7"></ChevronLeft>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{"Edit Details"}</h1>
          </div>
          <form onSubmit={handleSubmit(handleEditProfileDetails)} className='flex flex-col gap-3 sm:gap-4'>
              <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Full Name <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                   <input
                    type='text'
                    {...register("full_name")}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                    placeholder='Enter full name'
                    ></input>
                    {errors.full_name && <span className='text-xs sm:text-sm text-red-500'>{errors.full_name.message}</span>}
                </div>
              </div>
              <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className="text-sm sm:text-base">Email <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                   <input
                    type='text'
                    {...register("email")}
                    className='p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none'
                    placeholder='Enter email address'
                    ></input>
                    {errors.email && <span className='text-xs sm:text-sm text-red-500'>{errors.email.message}</span>}
                </div>
             </div>
             <div className="flex justify-center items-center pt-2">
               <button type="submit" disabled={loading} className="p-2.5 sm:p-3 hover:bg-primary/90 disabled:cursor-not-allowed w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white text-sm sm:text-base font-medium">
                {
                  loading ? 
                  <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6"></LoaderCircle> :
                   "Save"
                }
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}

export default ProfileForm