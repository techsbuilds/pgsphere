import React from 'react'

//Importing image
import DELETE from '../assets/warning.png'

function ConfirmationBox({openForm, onClose, confirmButton, confirmText, onConfirm, loader}) {

   console.log(openForm)
  if(!openForm) return null 

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-3 sm:p-4'>
        <div className='p-3 sm:p-4 bg-white rounded-2xl flex w-full max-w-md flex-col gap-3 sm:gap-4'>
           <div className='flex items-start sm:items-center gap-3 sm:gap-4'>
             <img alt='warning' className='w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0' src={DELETE}></img>
             <div className='flex flex-col gap-1 sm:gap-2 flex-1 min-w-0'>
                <span className='text-lg sm:text-xl lg:text-2xl font-medium'>Confirmation</span>
                <span className='text-sm sm:text-base text-gray-500 break-words'>{confirmText}</span>
             </div>
           </div>
           <div className='flex justify-end'>
             <div className='flex items-stretch sm:items-center gap-2 w-full sm:w-auto'>
                <button onClick={()=>onClose(false)} className='p-2 sm:p-1.5 border cursor-pointer hover:bg-gray-200 transition-all duration-300 rounded-md w-full sm:w-28 border-neutral-300 text-black text-xs sm:text-sm font-medium flex justify-center items-center'>Cancel</button>
                <button disabled={loader} onClick={onConfirm} className='p-2 sm:p-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md w-full sm:w-28 transition-all duration-300 bg-red-500 text-white hover:bg-red-600 text-xs sm:text-sm font-medium flex justify-center items-center'>{confirmButton}</button>
             </div>
           </div>
        </div>
    </div>
  )
}

export default ConfirmationBox