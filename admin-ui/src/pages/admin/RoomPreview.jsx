import React, { useEffect, useState } from 'react'
import CustomerForm from '../../components/CustomerForm';
import VerifyCustomer from '../../components/VerifyCustomer';
import DepositeForm from '../../components/DepositeForm';

import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRoomById } from '../../services/roomService'

import { useCustomerTable } from '../../hooks/useCustomerTable'


import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

function RoomPreview() {
  const [room,setRoom] = useState({})
  const [roomLoading,setRoomLoading] = useState(false)
  const [openForm,setOpenForm] = useState(false)
  const [selectedCustomer,setSelectedCustomer] = useState(null)
  const [openVerifyCustomer,setOpenVerifyCustomer] = useState(false)
  const [openDepositeForm,setOpenDepositeForm] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleOpenForm = (customer=null) =>{
    setSelectedCustomer(customer)
    setOpenForm(true)
  }

  const handleOpenVerifyCustomer = (data) =>{
    setSelectedCustomer(data)
    setOpenVerifyCustomer(true)
  }

  const handleOpenDepositeForm = (data) => {
    setSelectedCustomer(data)
    setOpenDepositeForm(true)
  }

  const { loading, rows, columns, refetch} = useCustomerTable(handleOpenForm, location.state, handleOpenVerifyCustomer, handleOpenDepositeForm)

  const handleCloseForm = (refresh) =>{
    setSelectedCustomer(null)
    setOpenForm(false)
    if(refresh) refetch()
  }

  const handleCloseVerifyCustomer = (refresh = false) =>{
    setSelectedCustomer(null)
    setOpenVerifyCustomer(false)
    if(refresh) refetch()
  }

  const handleCloseDepositeForm = (refresh = false) =>{
    setSelectedCustomer(null)
    setOpenDepositeForm(false)
    if(refresh) refetch()
  }

  useEffect(()=>{
    const handleGetRoomDetails = async () =>{
      try{
        setRoomLoading(true)
        const data = await getRoomById(location.state)
        setRoom(data)
      }catch(err){
        toast.error(err?.message)
      }finally{
        setRoomLoading(false)
      }
    }

    if(location.state) {
      handleGetRoomDetails()
    }else{
      navigate('/')
    }
  },[])

  return (
    <div className='flex flex-col px-2 sm:px-4 lg:px-8 gap-4 sm:gap-6 lg:gap-8 h-full'>
       {openForm && <CustomerForm selectedCustomer={selectedCustomer} onClose={handleCloseForm}></CustomerForm>}
       <VerifyCustomer customer={selectedCustomer} onClose={handleCloseVerifyCustomer} openForm={openVerifyCustomer} ></VerifyCustomer>
       <DepositeForm openForm={openDepositeForm} customer={selectedCustomer} onClose={handleCloseDepositeForm}></DepositeForm>

       {/* Breadcrumb Navigation */}
       <div className='flex items-center gap-2 text-sm sm:text-base'>
         <span className='cursor-pointer text-gray-700 hover:text-primary' onClick={()=>navigate(-1)}>Rooms</span>
         <span className='text-gray-400'>&gt;</span>
         <span className='font-medium'>Room {room.room_id}</span>
       </div>

       {/* Room Information Card */}
       {roomLoading ? (
         <div className='w-full bg-[#edf2f6] rounded-2xl p-3 sm:p-4 lg:p-6 animate-pulse'>
            {/* Mobile Layout Skeleton */}
            <div className='block sm:hidden'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                  <div className='h-6 bg-gray-200 rounded w-48'></div>
                  <div className='h-4 bg-gray-200 rounded w-32'></div>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-2'>
                    <div className='h-3 bg-gray-200 rounded w-16'></div>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </div>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-2'>
                    <div className='h-3 bg-gray-200 rounded w-16'></div>
                    <div className='h-5 bg-gray-200 rounded w-8'></div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='h-3 bg-gray-200 rounded w-12'></div>
                    <div className='h-4 bg-gray-200 rounded w-16'></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout Skeleton */}
            <div className='hidden sm:flex justify-between items-start gap-4 lg:gap-12'>
              <div className='flex flex-col gap-2'>
                <div className='h-7 bg-gray-200 rounded w-56'></div>
                <div className='h-5 bg-gray-200 rounded w-40'></div>
              </div>
              <div className='flex flex-col flex-1 px-4 lg:px-8 gap-2'>
                <div className='grid grid-cols-3 gap-4 items-center'>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-4'>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                    <div className='h-8 bg-gray-200 rounded w-12'></div>
                  </div>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-4'>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                    <div className='h-8 bg-gray-200 rounded w-12'></div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                    <div className='h-8 bg-gray-200 rounded w-20'></div>
                  </div>
                </div>
              </div>
            </div>
         </div>
       ) : (
         <div className='w-full bg-[#edf2f6] rounded-2xl p-3 sm:p-4 lg:p-6'>
            {/* Mobile Layout */}
            <div className='block sm:hidden'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1'>
                  <h1 className='text-xl font-semibold'>{room?.room_type==="Room" ? "Room" : "Hall"} {room?.room_id} <small className='text-sm text-gray-500'>({room?.service_type})</small></h1>
                  <span className='text-base font-medium text-[#36454f]'>{room?.branch?.branch_name}</span>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-2'>
                    <span className='text-xs font-medium text-[#697282]'>Capacity</span>
                    <h1 className='text-lg font-bold'>{room?.capacity}</h1>
                  </div>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-2'>
                    <span className='text-xs font-medium text-[#697282]'>Occupied</span>
                    <h1 className='text-lg font-bold'>{room?.filled}</h1>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-xs font-medium text-[#697282]'>Status</span>
                    <h1 className='text-sm font-bold'>{(room?.capacity === room?.filled ? "Full" : "Available")}</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className='hidden sm:flex justify-between items-start gap-4 lg:gap-12'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-2xl font-semibold'>{room?.room_type==="Room" ? "Room" : "Hall"} {room?.room_id} <small className='text-sm text-gray-500'>({room?.service_type})</small></h1>
                <span className='text-lg font-medium text-[#36454f]'>{room?.branch?.branch_name}</span>
              </div>
              <div className='flex flex-col flex-1 px-4 lg:px-8 gap-2'>
                <div className='grid grid-cols-3 gap-4 items-center'>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-4'>
                    <span className='text-lg font-medium text-[#697282]'>Capacity</span>
                    <h1 className='text-2xl font-bold'>{room?.capacity}</h1>
                  </div>
                  <div className='flex flex-col gap-1 border-r border-neutral-300 pr-4'>
                    <span className='text-lg font-medium text-[#697282]'>Occupied</span>
                    <h1 className='text-2xl font-bold'>{room?.filled}</h1>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <span className='text-lg font-medium text-[#697282]'>Status</span>
                    <h1 className='text-2xl font-bold'>{(room?.capacity === room?.filled ? "Full" : "Available")}</h1>
                  </div>
                </div>
              </div>
            </div>
         </div>
       )}

       {/* Customer Table */}
       <div className='flex-1 ag-theme-alpine w-full min-h-0'>
       <Box 
            sx={{
             height: "100%",
             "& .MuiDataGrid-root": {
            border: "none", 
            borderRadius: "12px",
            overflow: "hidden",
            },
            "& .MuiDataGrid-columnHeaders": {
               backgroundColor: "#edf3fd",  // Header background color
               fontWeight: "bold",  
               fontSize:'.9rem'
             },    
            }}>
           <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={70}
            loading={loading}
            initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
           }}
           pageSizeOptions={[5,10]}
           disableRowSelectionOnClick
          />
         </Box>
       </div>
    </div>
  )
}

export default RoomPreview