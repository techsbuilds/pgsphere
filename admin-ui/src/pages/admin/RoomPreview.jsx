import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRoomById } from '../../services/roomService'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

import { useCustomerTable } from '../../hooks/useCustomerTable'
import CustomerForm from '../../components/CustomerForm'

// ✅ AG Grid CSS (core and theme)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Or any other theme

ModuleRegistry.registerModules([AllCommunityModule]);

function RoomPreview() {
  const [room,setRoom] = useState({})
  const [openForm,setOpenForm] = useState(false)
  const [selectedCustomer,setSelectedCustomer] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleOpenForm = (customer=null) =>{
    setSelectedCustomer(customer)
    setOpenForm(true)
  }

  const { loading, rows, columns, refetch} = useCustomerTable(handleOpenForm, location.state)

  const handleCloseForm = (refresh) =>{
    setSelectedCustomer(null)
    setOpenForm(false)
    if(refresh) refetch()
  }

  useEffect(()=>{
    const handleGetRoomDetails = async () =>{
      try{
        const data = await getRoomById(location.state)
        setRoom(data)
      }catch(err){
        toast.error(err?.message)
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
       
       {/* Breadcrumb Navigation */}
       <div className='flex items-center gap-2 text-sm sm:text-base'>
         <span className='cursor-pointer hover:font-medium text-blue-600' onClick={()=>navigate(-1)}>Rooms</span>
         <span className='text-gray-400'>&gt;</span>
         <span className='text-gray-700'>Room {room.room_id}</span>
       </div>

       {/* Room Information Card */}
       <div className='w-full bg-[#edf2f6] rounded-2xl p-3 sm:p-4 lg:p-6'>
          {/* Mobile Layout */}
          <div className='block sm:hidden'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <h1 className='text-xl font-semibold'>Room {room?.room_id}</h1>
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
              <h1 className='text-2xl font-semibold'>Room {room?.room_id}</h1>
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

       {/* Customer Table */}
       <div className='flex-1 ag-theme-alpine w-full min-h-0'>
         <AgGridReact
           rowData={rows}
           rowHeight={70}
           loading={loading}
           headerHeight={54}
           columnDefs={columns}
           modules={[AllCommunityModule]}
           pagination={true}
           paginationPageSize={10}
           defaultColDef={{
             resizable: true,
             sortable: true,
             // filter: true,
           }}
         />
       </div>
    </div>
  )
}

export default RoomPreview