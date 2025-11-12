import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { LoaderCircle } from 'lucide-react'
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
    <div className='flex flex-col h-full gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0'>
      <Breadcrumb 
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      ></Breadcrumb>
      {
        loading ?
          <div className='flex h-full w-full justify-center items-center py-8 sm:py-12'>
            <LoaderCircle size={24} className='sm:w-8 md:h-8 text-blue-500 animate-spin'></LoaderCircle>
          </div>
          : complaints.length === 0 ?
            <div className='flex h-full w-full justify-center items-center py-8 sm:py-12'>
              <div className='flex flex-col items-center gap-2 sm:gap-3'>
                <p className='text-gray-500 text-sm sm:text-base'>No Complaints Found</p>
              </div>
            </div>
            :
            <div className='flex flex-col gap-4 sm:gap-6 w-full'>
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