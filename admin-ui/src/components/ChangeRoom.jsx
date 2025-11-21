import React, { useState, useEffect } from 'react'
import { changeRoomSchema } from '../validations/changeroomSchema';
import { getAllBranch } from '../services/branchService';
import { getRoomByBranchId } from '../services/roomService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { changeRoom } from '../services/roomService';

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";

function ChangeRoom({openForm, selectedCustomer, onClose}) {
   const [loading, setLoading] = useState(false) 
   const [branches, setBranches] = useState([])
   const [rooms, setRooms] = useState([])
   const [selectedBranch, setSelectedBranch] = useState('')
   const [selectedRoom, setSelectedRoom] = useState('')

   const {
        register,
        handleSubmit,
        formState: {errors},
        reset
      } = useForm({
        mode:'onChange',
        resolver: zodResolver(changeRoomSchema),
        defaultValues: {
           room:'',
           branch:'',
        }
   })

   useEffect(()=> {
     if(selectedCustomer){
        reset({
            room:selectedCustomer.room._id,
            branch:selectedCustomer.branch._id,
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

   useEffect(()=> {
    if(selectedBranch) handleGetRoomsByBranchId(selectedBranch)
   },[selectedBranch])

   const handleChangeRoom = async (formData) => {
      console.log(formData)
      setLoading(true)
      try{
        const data = await changeRoom(selectedCustomer._id,formData)
        toast.success('Room changed successfully.')
        onClose(true)
      } catch(err){
        console.log(err)
        toast.error(err?.message)
      } finally {
        setLoading(false)
      }
   }


   if(!openForm) return null

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6'
    onClick={() => onClose(false)}>

        <div onClick={(e)=> e.stopPropagation()} className='flex w-full max-w-xl flex-col gap-4 bg-white rounded-2xl p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4'>
          <div className="flex items-center gap-2 mb-2">
            <ChevronLeft size={28} onClick={()=>onClose(false)} className="cursor-pointer"></ChevronLeft>
            <h1 className="text-2xl font-semibold">Change Room</h1>
           </div>
           <form onSubmit={handleSubmit(handleChangeRoom)} className="flex flex-col gap-4">
            <div className='flex flex-col gap-2'>
              <label className='text-sm sm:text-base'>Branch <span className='text-sm text-red-500'>*</span></label>
              <div className='flex flex-col'>
                <select {...register("branch", {onChange: (e) => setSelectedBranch(e.target.value)})} value={selectedBranch} className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'>
                  <option value={''}>--- Select Branch ---</option>
                  {branches.map((item,index) => (
                    <option key={index} value={item._id}>{item.branch_name}</option>
                  ))}
                </select>
                {errors.branch && <span className='text-xs sm:text-sm text-red-500'>{errors.branch.message}</span>}
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <label className='text-sm sm:text-base'>Room <span className='text-sm text-red-500'>*</span></label>
              <div className='flex flex-col'>
                <select {...register("room", {onChange: (e) => setSelectedRoom(e.target.value)})} value={selectedRoom} className='p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base'>
                  <option value={''}>--- Select Room ---</option>
                  {rooms.map((item,index) => (
                    <option key={index} value={item._id}>{item.room_id} - {item.capacity - item.filled} available</option>
                  ))}
                </select>
                {errors.room && <span className='text-xs sm:text-sm text-red-500'>{errors.room.message}</span>}
              </div>
            </div>
            <button type='submit' disabled={loading} className='bg-primary text-white px-4 py-2 rounded-md text-sm sm:text-base flex justify-center items-center font-medium'>{loading ? <LoaderCircle size={20} className="animate-spin"></LoaderCircle> : "Change Room"}</button>
           </form>
        </div>

    </div>
  )
}

export default ChangeRoom