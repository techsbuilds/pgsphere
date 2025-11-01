import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

//importing icons
import { ChevronLeft, LoaderCircle } from 'lucide-react'

import { toast } from 'react-toastify'
import { useState } from 'react'
import { floorSchema } from '../validations/floorSchema'
import { createFloor } from '../services/floorService'


function FloorForm({openForm,onClose, branch, floor}) {
   const [loader, setLoader] = useState(false)

   const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(floorSchema),
    defaultValues: {
        floor_name:'',
        branch:branch
    }
  });

  useEffect(()=>{
    if(floor){
        reset({
            floor_name:floor.floor_name,
            branch:branch
        })
    }else{
        reset({
            floor_name:'',
            branch:branch
        })
    }
  },[floor])

  if(!openForm) return false 

  const handleCreateFloor = async (formData) =>{
    console.log(formData)
    setLoader(true)
    try{
        const data = await createFloor(formData)
        toast.success('New floor created successfully')
        onClose(true)
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoader(false)
    }
  }

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6' onClick={()=>onClose(false)}>
      <div className='flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4' 
      onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center gap-2'>
              <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer" onClick={()=>onClose(false)}></ChevronLeft>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold'>{floor ? "Edit Floor Details" : "Add New Floor"}</h1>
        </div>
        <form onSubmit={handleSubmit(handleCreateFloor)} className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex flex-col gap-1 sm:gap-2'>
                <label className='text-sm sm:text-base'>Floor Name <span className='text-sm text-red-500'>*</span></label>
                <div className='flex flex-col'>
                    <input 
                      {...register('floor_name')}
                      type="text" 
                      className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base' 
                      placeholder='Enter floor name'
                    />
                    {errors.floor_name && <span className='text-xs sm:text-sm text-red-500'>{errors.floor_name.message}</span>}
                </div>
            </div>
            <div className="flex justify-end gap-4 items-center">
            <button onClick={()=>onClose(false)} className="p-2 hover:bg-gray-100 transition-all duration-300 text-sm w-32 cursor-pointer flex justify-center items-center rounded-md border border-neutral-300">
              Cancel
            </button>
            <button disabled={loader} type="submit" className="p-2 min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white font-medium">
              {
                loader ? 
                <LoaderCircle className="animate-spin"></LoaderCircle>
                : !floor ? "Create Floor" : "Update Floor"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FloorForm