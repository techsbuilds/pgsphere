import React, { useState } from 'react'

//Importing icons
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { verifyCustomerTransaction } from '../services/transactionService'

const generateStatusStyle = (status) =>{
   switch(status){
     case "pending":
        return (
            <span className="text-yellow-500 text-sm p-1 px-2 bg-yellow-100 rounded-2xl border border-yellow-500">
              Pending
            </span>
          )
     case 'completed':
        return (
            <span className="text-green-500 text-sm p-1 px-2 bg-green-100 rounded-2xl border border-green-500">
              Completed
            </span>
          )
     case 'rejected':
        return (
            <span className="text-red-500 text-sm p-1 px-2 bg-red-100 rounded-2xl border border-red-500">
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
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center'>
        <div className='flex w-xl flex-col gap-4 bg-white rounded-2xl p-4'>
           <div className='flex justify-between items-center'>
             <div className="flex items-center gap-2 mb-2">
               <ChevronLeft size={28} onClick={()=>onClose(false)} className="cursor-pointer"></ChevronLeft>
               <h1 className="text-2xl font-semibold">Payment Request</h1>
             </div>
             {generateStatusStyle(requestDetails.status)}
           </div>

           <div className='flex flex-col gap-2'>
             <h2>Payment Proof</h2>
             <img src={requestDetails.payment_proof} className='w-full h-72 object-contain'></img>
               <div className='p-2 flex items-center bg-slate-50 gap-2 border border-neutral-300 rounded-md'>
                 <span className='font-medium'>Bank Account</span>
                 <span>{requestDetails.bank_account.account_holdername}</span>
               </div>
           </div>

           <div className='grid grid-cols-2 mb-2 items-center gap-4'>
             <div className='flex p-2 bg-slate-50 border border-neutral-300 rounded-md items-center gap-2'>
                 <span className='font-medium'>Amount</span>
                 <span className=''>₹{requestDetails.amount}</span>
             </div>
             <div className='flex p-2 bg-slate-50 border border-neutral-300 rounded-md items-center gap-2'>
                 <span className='font-medium'>Payment Mode</span>
                 <span className=''>{requestDetails.payment_mode}</span>
             </div>
           </div>

           {
            requestDetails.status === 'pending' && 
            <div className="flex justify-end gap-2 items-center">
                 <button type='button' onClick={()=>handleVerifyCustomerTransaction('rejected')} disabled={loading} className={`p-2 disabled:cursor-not-allowed min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center rounded-md items-center bg-red-500 text-white hover:bg-red-600 font-medium`}>
                    Reject
                 </button>
                 <button type="button" onClick={()=>handleVerifyCustomerTransaction('completed')} disabled={loading} className={`p-2 disabled:cursor-not-allowed min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white font-medium`}>
                  {
                    "Approve"
                  }
                 </button> 
            </div>
           }
        </div>
    </div>
  )
}

export default PaymentProofForm