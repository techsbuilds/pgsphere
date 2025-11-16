import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { toast } from 'react-toastify'
import { getAllComplaints } from '../../services/complaintService'
import ComplaintCard from '../../components/ComplaintCard'

function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const handleGetAllComplaints = async () => {
    setLoading(true)
    try {
      const data = await getAllComplaints(selectedBranch, selectedStatus)
      console.log(data)
      setComplaints(data)
    } catch (error) {
      toast.error(error?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGetAllComplaints()
  }, [selectedBranch, selectedStatus])

  return (
    <div className='flex flex-col h-full gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-4 lg:px-0'>
      <Breadcrumb 
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      ></Breadcrumb>
      {
        loading ?
          <div className='flex flex-col gap-3 sm:gap-4 w-full'>
            {[1, 2, 3].map((item) => (
              <div key={item} className="w-full rounded-2xl shadow-sm border border-neutral-300 bg-white p-5 animate-pulse">
                {/* Description Skeleton */}
                <div className="flex items-start mb-3 w-full relative pr-32">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                
                {/* Button Skeleton */}
                <div className="absolute right-2 top-10 -translate-y-1/2 z-30">
                  <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
                </div>

                {/* Customer Name Skeleton */}
                <div className="mb-2 w-full flex items-center gap-1">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>

                {/* Branch and Room Skeleton */}
                <div className="flex items-center gap-3 mb-2 w-full">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>

                {/* Category and Date Skeleton */}
                <div className="flex items-center gap-2 text-gray-500 w-full">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
          : complaints.length === 0 ?
            <div className='flex h-full w-full justify-center items-center py-6 sm:py-8 lg:py-12 min-h-[200px] sm:min-h-[300px]'>
              <div className='flex flex-col items-center gap-2 sm:gap-3 px-4'>
                <p className='text-gray-500 text-sm sm:text-base text-center'>No Complaints Found</p>
              </div>
            </div>
            :
            <div className='flex flex-col gap-3 sm:gap-4 w-full'>
              {
                complaints.map((item, index) => (
                  <ComplaintCard key={index} item={item} onRefresh={handleGetAllComplaints}></ComplaintCard>
                ))
              }
            </div>
      }
    </div>
  )
}

export default Complaints