import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getRoomByBranchId } from '../services/roomService'
import { getAllFloors } from '../services/floorService'

//Importing icons
import { Edit, LoaderCircle, Plus, SquarePen } from 'lucide-react'
import { BedSingle } from 'lucide-react';
import RoomCard from './RoomCard';
import RoomForm from './RoomForm';
import FloorForm from './FloorForm';

function BranchRooms({branchId}) {
  const [floors,setFloors] = useState([])
  const [loading,setLoading] = useState(false)
  const [openForm,setOpenForm] = useState(false)
  const [openFloorForm, setOpenFloorForm] = useState(false)
  const [selectedRoom,setSelectedRoom] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(null)


  const handleGetAllFloors = async ()=>{
    setLoading(true)
    try{
      const data = await getAllFloors(branchId)
      setFloors(data)
    }catch(err){
      toast.error(err?.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    handleGetAllFloors()
  },[])

  const handleOpenForm = (room=null, floor) =>{
     setOpenForm(true)
     setSelectedRoom(room)
     setSelectedFloor(floor)
  }

  const handleCloseForm = (refresh = false) =>{
     setOpenForm(false)
     setSelectedRoom(null)
     setSelectedFloor(null)
     if(refresh) handleGetAllFloors()
  }

  const handleOpenFloorForm = (floor = null) =>{
      setSelectedFloor(floor)
      setOpenFloorForm(true)
  }

  const handleCloseFloorForm = (refresh = false) =>{
      setOpenFloorForm(false)
      setSelectedFloor(null)
      if(refresh) handleGetAllFloors()
  } 


  return (
    <div className='flex flex-col gap-4 sm:gap-6 lg:gap-8'>
         {openForm && <RoomForm branchId={branchId} onClose={handleCloseForm} floor={selectedFloor} selectedRoom={selectedRoom}></RoomForm>}
         <FloorForm openForm={openFloorForm} branch={branchId} onClose={handleCloseFloorForm} floor={selectedFloor}></FloorForm>
         <div className='flex flex-row items-center justify-between gap-4'>
             <h1 className='text-xl sm:text-2xl font-semibold'>Rooms</h1>
             <button onClick={()=>handleOpenFloorForm(null)} className='md:p-2 p-1.5 bg-primary transition-all duration-300 text-sm md:text-base hover:bg-primary/90 font-medium cursor-pointer backdrop-blur-md rounded-md text-white w-fit'>
               <span className='hidden md:block'>Add New Floor</span>
               <Plus className='block md:hidden' size={18}></Plus>
             </button>
         </div>
         {
          loading ? 
          <div className='flex h-32 sm:h-36 justify-center items-center'>
             <LoaderCircle className='animate-spin text-blue-500 w-8 h-8 sm:w-9 sm:h-9' size={32}></LoaderCircle>
          </div>
          :floors.length === 0 ?
          <div className='flex h-32 sm:h-36 justify-center items-center'>
              <div className='flex items-center flex-col gap-1 sm:gap-2'>
                 <BedSingle className='text-gray-500 w-6 h-6 sm:w-8 sm:h-8' size={24}></BedSingle>
                 <span className='text-gray-500 text-sm sm:text-base'>No Rooms Found.</span>
              </div>
          </div> :
          <div className='flex flex-col gap-6'>
           {
             floors.map((floor, index) => (
               <div key={index} className='flex flex-col gap-2'>
                  <div className='flex justify-between items-center'>
                    <h2 className='text-lg sm:text-xl font-medium'>{floor.floor.floor_name}</h2>
                   <div className='flex items-center gap-2'>
                     <button onClick={()=>handleOpenForm(null, floor.floor)} className='p-1.5 bg-black/40 transition-all duration-300 text-sm md:text-base hover:bg-black/80 font-medium cursor-pointer backdrop-blur-md rounded-md text-white w-fit'>
                      <Plus className='block' size={18}></Plus>
                     </button>
                    <button onClick={()=>handleOpenFloorForm(floor.floor)} className='p-1.5 bg-black/40 transition-all duration-300 text-sm md:text-base hover:bg-black/80 font-medium cursor-pointer backdrop-blur-md rounded-md text-white w-fit'>
                      <Edit className='block' size={18}></Edit>
                     </button>
                   </div>
                  </div>
                 <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch gap-3 sm:gap-4'> 
                 {
                   floor.rooms.length === 0 ?
                    <div onClick={()=>handleOpenForm(null, floor.floor)} className='relative hover:scale-[1.02] h-36 transition-all duration-300 cursor-pointer rounded-2xl shadow-sm bg-gradient-to-br from-[#d8e8fe] to-[#c3ddfe] flex justify-center items-center flex-col gap-2'>
                        <Plus size={36}></Plus>
                        <span>Add New Room</span>
                    </div>
                   :
                   floor.rooms.map((room, index)=> (
                    <RoomCard openForm={handleOpenForm} key={index} room={room}></RoomCard>
                   ))
                 }
                 </div>
               </div>
             ))
           }
          </div>
         }

    </div>
  )
}

export default BranchRooms