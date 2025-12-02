import React, { useState } from 'react'

//Importing icons
import { ChevronLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { verifyCustomerTransaction } from '../services/transactionService'

const generateStatusStyle = (status) =>{
   switch(status){
     case "pending":
        return (
            <span className="text-yellow-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-yellow-100 rounded-2xl border border-yellow-500">
              Pending
            </span>
          )
     case 'completed':
        return (
            <span className="text-green-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-green-100 rounded-2xl border border-green-500">
              Completed
            </span>
          )
     case 'rejected':
        return (
            <span className="text-red-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-red-100 rounded-2xl border border-red-500">
              Rejected
            </span>
          )
   }
}

function PaymentProofForm({openForm, onClose, requestDetails}) {
  const [loading,setLoading] = useState(false)

  if(!openForm){
    return null
  }  

  const handleVerifyCustomerTransaction = async (status) =>{
     setLoading(true)
     try{
        const data = await verifyCustomerTransaction({
            status,
            transactionId:requestDetails.transactionId
        })
        toast.success(`Customer payment request ${status} successfully.`)
        onClose(true)
     }catch(err){
        console.log(err)
        toast.error(err?.message)
     }finally{
        setLoading(false)
     }
  }

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-3 sm:p-4'>
        <div className='flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto'>
           <div className='flex justify-between items-start sm:items-center gap-2 sm:gap-0'>
             <div className="flex items-center gap-2">
               <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer flex-shrink-0" onClick={()=>onClose(false)}></ChevronLeft>
               <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Payment Request</h1>
             </div>
             <div className="flex-shrink-0">
               {generateStatusStyle(requestDetails?.status)}
             </div>
           </div>

           <div className='flex flex-col gap-2'>
             <h2 className='text-sm sm:text-base font-medium'>{requestDetails?.payment_proof_image ? "Payment Proof" : "Bank Details"}</h2>
             {requestDetails?.payment_proof_image && <img src={requestDetails?.payment_proof} className='w-full h-48 sm:h-64 lg:h-72 object-contain rounded-md border border-neutral-200'></img>}
               <div className='p-2 flex items-center bg-slate-50 gap-2 border border-neutral-300 rounded-md text-xs sm:text-sm'>
                 <span className='font-medium'>Bank Account:</span>
                 <span className='truncate'>{requestDetails?.bank_account?.account_holdername}</span>
               </div>
           </div>

           <div className='grid grid-cols-1 sm:grid-cols-2 mb-2 items-center gap-2 sm:gap-4'>
             <div className='flex p-2 bg-slate-50 border border-neutral-300 rounded-md items-center gap-2 text-xs sm:text-sm'>
                 <span className='font-medium'>Amount:</span>
                 <span>₹{requestDetails?.amount}</span>
             </div>
             <div className='flex p-2 bg-slate-50 border border-neutral-300 rounded-md items-center gap-2 text-xs sm:text-sm'>
                 <span className='font-medium'>Payment Mode:</span>
                 <span className='capitalize'>{requestDetails?.payment_mode}</span>
             </div>
           </div>

           {
            requestDetails?.status === 'pending' && 
            <div className="flex justify-end items-stretch sm:items-center gap-2">
                 <button type='button' onClick={()=>handleVerifyCustomerTransaction('rejected')} disabled={loading} className='p-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:min-w-32 text-xs sm:text-sm transition-all duration-300 cursor-pointer flex justify-center rounded-md items-center bg-red-500 text-white hover:bg-red-600 font-medium'>
                    Reject
                 </button>
                 <button type="button" onClick={()=>handleVerifyCustomerTransaction('completed')} disabled={loading} className='p-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:min-w-32 text-xs sm:text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white hover:bg-[#2a3658] font-medium'>
                    Approve
                 </button> 
            </div>
           }
        </div>
    </div>
  )
}

export default PaymentProofForm