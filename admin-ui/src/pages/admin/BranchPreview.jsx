import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import { toast } from 'react-toastify'
import { getBranchById, getDashboardSummery } from '../../services/branchService'
import BranchRooms from '../../components/BranchRooms'

//Importing icons
import { Image } from 'lucide-react';

function BranchPreview() {
  const location = useLocation()
  const navigate = useNavigate()
  const [branch,setBranch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dashboardData,setDashboardData] = useState({
   totalRooms:0,
   totalCustomers:0,
   totalEmployees:0
  })

  const handleGetDashboardSummery = async () =>{
    setLoading(true)
    try{
      const data = await getDashboardSummery(location.state)
      setDashboardData(data)
    }catch(err){
      toast.error(err?.message)
    }finally{
      setLoading(false)
    }
  }

  const handleGetBranch = async () =>{
     setLoading(true)
     try{
        const data = await getBranchById(location.state)
        setBranch(data)
     }catch(err){
        toast.error(err?.message)
     }finally{
        setLoading(false)
     }
  }

  const handleGetBranchData = async () =>{
     setLoading(true)
     await handleGetBranch()
     await handleGetDashboardSummery()
     setLoading(false)
  }

  useEffect(()=>{
    if(location.state){
      handleGetBranchData()
    }else{
      navigate('/admin')
    }
  },[location.state])

  return (
    <div className='flex flex-col gap-4 sm:gap-6 lg:gap-8'>
        <Breadcrumb></Breadcrumb>

        {/* Branch Details */}
        {loading ? (
          <div className='flex flex-col lg:flex-row bg-[#edf2f7] overflow-hidden items-stretch gap-4 sm:gap-6 lg:gap-8 rounded-2xl animate-pulse'>
            {/* Skeleton Image */}
            <div className='w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto bg-gray-200'></div>
            {/* Skeleton Content */}
            <div className='w-full lg:w-3/5 p-4 sm:p-6 lg:p-8'>
              <div className='w-full flex flex-col gap-4 sm:gap-6 lg:gap-8'>
                <div className='flex flex-col gap-2'>
                  <div className='h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64'></div>
                  <div className='h-4 sm:h-5 bg-gray-200 rounded w-64 sm:w-80'></div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch'>
                  <div className='flex border-r-0 sm:border-r border-neutral-300 flex-col gap-2 p-2 sm:p-0'>
                    <div className='h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24'></div>
                    <div className='h-8 sm:h-10 bg-gray-200 rounded w-12 sm:w-16'></div>
                  </div>
                  <div className='flex border-r-0 sm:border-r border-neutral-300 flex-col gap-2 p-2 sm:p-0'>
                    <div className='h-4 sm:h-5 bg-gray-200 rounded w-16 sm:w-20'></div>
                    <div className='h-8 sm:h-10 bg-gray-200 rounded w-12 sm:w-16'></div>
                  </div>
                  <div className='flex flex-col gap-2 p-2 sm:p-0'>
                    <div className='h-4 sm:h-5 bg-gray-200 rounded w-20 sm:w-24'></div>
                    <div className='h-8 sm:h-10 bg-gray-200 rounded w-12 sm:w-16'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col lg:flex-row bg-[#edf2f7] overflow-hidden items-stretch gap-4 sm:gap-6 lg:gap-8 rounded-2xl'>
            <div className='w-full lg:w-1/3 h-48 sm:h-56 lg:h-auto'>
              {
               branch?.branch_image ?
               <img className='object-cover h-full w-full' src={branch?.branch_image}></img>
               :<div className="bg-gradient-to-br from-[#5f9df9] to-[#636ef2] w-full h-full flex justify-center items-center">
                 <Image size={32} className="sm:w-10 sm:h-10 text-white"></Image>
                </div>
              }
            </div>
            <div className='w-full lg:w-3/5 p-4 sm:p-6 lg:p-8'>
               <div className='w-full flex flex-col gap-4 sm:gap-6 lg:gap-8'>
                 <div className='flex flex-col gap-1'>
                   <h1 className='text-xl sm:text-2xl font-semibold'>{branch?.branch_name}</h1>
                   <span className='text-[#98a3b3] text-sm sm:text-base'>{branch?.branch_address}</span>
                 </div>
                 <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch'>
                    <div className='flex border-r-0 sm:border-r border-neutral-300 flex-col gap-2 p-2 sm:p-0'>
                       <span className='text-sm sm:text-lg text-gray-500'>Customers</span>
                       <h1 className='text-2xl sm:text-3xl font-bold'>{dashboardData.totalCustomers}</h1>
                    </div>
                    <div className='flex border-r-0 sm:border-r border-neutral-300 flex-col gap-2 p-2 sm:p-0'>
                       <span className='text-sm sm:text-lg text-gray-500'>Rooms</span>
                       <h1 className='text-2xl sm:text-3xl font-bold'>{dashboardData.totalRooms}</h1>
                    </div>
                    <div className='flex flex-col gap-2 p-2 sm:p-0'>
                       <span className='text-sm sm:text-lg text-gray-500'>Employees</span>
                       <h1 className='text-2xl sm:text-3xl font-bold'>{dashboardData.totalEmployees}</h1>
                    </div>
                 </div>
               </div>
            </div>
        </div>
        )}
        {/* Branch Rooms */}
        <BranchRooms branchId={location.state}></BranchRooms>
    </div>
  )
}

export default BranchPreview