import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

//importing icons
import { ChevronLeft, LoaderCircle } from 'lucide-react'

import { roomSchema } from '../validations/roomSchema'
import { toast } from 'react-toastify'
import { createRoom, updateRoom } from '../services/roomService'

function RoomForm({branchId,floor,onClose,selectedRoom}) {
  const [loading, setLoading] = useState(false)  

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(roomSchema),
    defaultValues: {
        room_id:'',
        capacity:1,
        remarks:'',
        service_type:'',
        room_type:''
    }
  });

  useEffect(()=>{
    if(selectedRoom){
        reset({
            room_id:selectedRoom.room_id,
            capacity:selectedRoom.capacity,
            remark:selectedRoom.remark,
            room_type:selectedRoom.room_type,
            service_type:selectedRoom.service_type
        })
    }
  },[selectedRoom])

  const handleAddRoom = async (formData) =>{
    try{
        setLoading(true)
        let payload = {
            room_id:formData.room_id,
            capacity:formData.capacity,
            service_type:formData.service_type,
            room_type:formData.room_type,
            remark:formData.remark,
            branch:branchId,
            floor_id:floor._id
        }
        const data = await createRoom(payload)
        toast.success('New room added successfully')
        onClose(true)
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoading(false)
    }
  }

  const handleUpdateRoom = async (formData) =>{
     try{
        setLoading(true)
        const data = await updateRoom(selectedRoom._id, formData)
        toast.success("Room details updated successfully.")
        onClose(true)
     }catch(err){
        console.log(err)
        toast.error(err?.message)
     }finally{
        setLoading(false)
     }
  }

  
  return (
    <div 
      className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6'
      onClick={() => onClose(false)}
    >
        <div 
          className='flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4'
          onClick={(e) => e.stopPropagation()}
        >
            <div className='flex items-center gap-2'>
              <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer" onClick={()=>onClose(false)}></ChevronLeft>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold'>{selectedRoom ? "Edit Room Details" : "Add New Room"}</h1>
            </div>
            <form onSubmit={handleSubmit(selectedRoom ? handleUpdateRoom :handleAddRoom)} className='flex flex-col gap-3 sm:gap-4'>
                <div className='flex flex-col gap-1 sm:gap-2'>
                    <label className='text-sm sm:text-base'>Room No <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                      <input 
                      type='text'
                      {...register('room_id')}
                      className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                      placeholder='Enter room no'
                      ></input>
                      {
                        errors.room_id && <span className='text-xs sm:text-sm text-red-500'>{errors.room_id.message}</span>
                      }
                    </div>
                </div>
                <div className='flex flex-col gap-1 sm:gap-2'>
                    <label className='text-sm sm:text-base'>Capacity <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                      <input 
                      type='number'
                      {...register('capacity', { valueAsNumber: true })}
                      className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                      placeholder='Enter capacity'
                      ></input>
                      {
                         errors.capacity && <span className='text-xs sm:text-sm text-red-500'>{errors.capacity.message}</span>
                      }
                    </div>
                </div>
                <div className='flex flex-col gap-1 sm:gap-2'>
                    <label className='text-sm sm:text-base'>Room Type <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                       <select
                        {...register('room_type')}
                       className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                       >
                        <option value={''}>-- Select Room Type --</option>
                        <option value={'Room'}>Room</option>
                        <option value={'Hall'}>Hall</option>
                       </select>
                    </div>
                </div>
                <div className='flex flex-col gap-1 sm:gap-2'>
                    <label className='text-sm sm:text-base'>Service Type <span className='text-sm text-red-500'>*</span></label>
                    <div className='flex flex-col'>
                       <select
                        {...register('service_type')}
                       className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                       >
                        <option value={''}>-- Select Service Type --</option>
                        <option value={'AC'}>AC</option>
                        <option value={'Non-AC'}>Non-AC</option>
                       </select>
                    </div>
                </div>
                <div className='flex flex-col gap-1 sm:gap-2'>
                    <label className='text-sm sm:text-base'>Remarks</label>
                    <textarea
                     {...register('remark')}
                     className='p-2 sm:p-3 resize-none border border-neutral-300 rounded-md outline-none text-sm sm:text-base'
                     placeholder='Enter remarks'
                     rows={3}></textarea>
                </div>
                <div className='flex justify-center items-center'>
                    <button type='submit' disabled={loading} className='p-2 hover:bg-blue-600 w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white font-medium text-sm sm:text-base'>
                        {
                            loading ? 
                            <LoaderCircle className='animate-spin w-4 h-4 sm:w-5 sm:h-5'></LoaderCircle> :
                            selectedRoom ? "Save" 
                            :"Submit"
                        }
                    </button>
                </div>
            </form>
            
        </div>
    </div>
  )
}

export default RoomForm