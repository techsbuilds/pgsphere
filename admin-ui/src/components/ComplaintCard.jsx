import React, { useState } from 'react'
import { AlertTriangle, Building2 ,User ,BedSingle} from 'lucide-react'
import { closeComplaints } from '../services/complaintService'
import { toast } from 'react-toastify'

function ComplaintCard({ item, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [isClosed, setIsClosed] = useState(item?.status === 'Close')
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  const MAX_DESCRIPTION_LENGTH = 60
  const description = item?.complaint_description || item?.description || 'No description'
  const shouldTruncate = description.length > MAX_DESCRIPTION_LENGTH
  const displayDescription = isDescriptionExpanded || !shouldTruncate 
    ? description 
    : description.substring(0, MAX_DESCRIPTION_LENGTH)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleOpen = async () => {
    setLoading(true)
    try {
      const response = await closeComplaints(item._id)
      console.log("close complaint response : ", response)
      toast.success(response?.message || "Complaint closed successfully.")
      setIsClosed(true)
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      console.log(err)
      toast.error(err?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="w-full rounded-2xl relative hover:scale-[1.02] transition-all duration-300 overflow-visible shadow-sm border cursor-pointer border-neutral-300 bg-white p-5">
      {/* Icon + Button - Vertically Centered on Right */}
      {!isClosed && (
        <div className="absolute right-2 top-10 -translate-y-1/2 z-30 flex justify-center items-center gap-2">

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpen()
            }}
            disabled={loading}
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-all duration-300 text-white text-sm font-medium rounded-xl whitespace-nowrap"
          >
            {loading ? 'Closing...' : 'Close It'}
          </button>
        </div>
      )}

      {/* Top Section: Description (left) */}
      <div className={`flex items-start mb-3 w-full relative ${!isClosed ? 'pr-32' : ''}`}>
        {/* Description on Left */}
        <div className="flex-1">
          <p className="text-gray-900 text-base font-medium inline">
            {displayDescription}
            {shouldTruncate && !isDescriptionExpanded && <span>...</span>}
            {shouldTruncate && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDescriptionExpanded(!isDescriptionExpanded)
                }}
                className="text-blue-500 pl-2 hover:text-blue-600 text-sm font-medium transition-colors whitespace-nowrap ml-0.5"
              >
                {isDescriptionExpanded ? ' View Less' : 'View More'}
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Customer Name */}
      <div className="mb-2 w-full flex items-center gap-1">
        <User className="text-gray-600" size={20} />
        <p className="text-gray-900 text-base">
          {item?.added_by?.customer_name || 'N/A'}
        </p>
      </div>

      {/* Branch and Room */}
      <div className="flex items-center gap-3 mb-2 w-full">

        <div className="flex items-center gap-1">
        <BedSingle className="text-gray-600" size={18} />
          <span className="text-gray-600 text-sm">
            {item?.added_by?.room?.room_type==="Room" ? "Room" : "Hall"} {item?.added_by?.room?.room_id || 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 className="text-gray-500" size={16} />
          <span className="text-gray-600 text-sm">
            {item?.branch?.branch_name || 'N/A'}
          </span>
        </div>
      </div>

      {/* Bottom Section: Category, Date, and Branch */}
      <div className="flex items-center gap-2 text-gray-500 text-xs w-full">
        {item?.category && (
          <>
            <span className='text-sm'>Category: {item.category}</span>
            <span className="text-gray-400">•</span>
          </>
        )}
        {item?.createdAt && (
          <span className='text-sm'>Submitted: {formatDate(item.createdAt)}</span>
        )}


      </div>
    </div>
  )
}

export default ComplaintCard

