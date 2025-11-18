import React, { useEffect, useState } from 'react'
import BankAccountForm from './BankAccountForm';

//Import icons
import { Pencil } from 'lucide-react';
import { RotateCw, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBankAccount } from '../services/bankAccountService';
import { convertIntoRupees } from '../helper';

function BankAccount() {
  const [selectedBankAccount,setSelectedBankAccount] = useState(null)  
  const [openForm,setOpenForm] = useState(false)
  const [bankAccounts,setBankAccounts] = useState([]) 
  const [totalBalance,setTotalBalance] = useState()

  const handleOpenForm = (account = null) =>{
    setOpenForm(true)
    setSelectedBankAccount(account)
  }

  const handleGetBankAccounts = async () =>{
    try{
        const data = await getAllBankAccount()
        setBankAccounts(data)
        setTotalBalance(data.reduce((x,y)=> x+y.current_balance,0))
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }
  }

  useEffect(()=>{
    handleGetBankAccounts()
  },[])

  const handleCloseForm = (refresh = false) =>{
    setOpenForm(false)
    if(refresh) handleGetBankAccounts()
  }

  console.log(bankAccounts)

  return (
    <div className='p-3 sm:p-4 border h-full border-neutral-200 bg-white rounded-md flex flex-col gap-3 sm:gap-4'>
      {openForm && <BankAccountForm selectedBankAccount={selectedBankAccount} onClose={handleCloseForm}></BankAccountForm>}
      
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
        <h1 className='text-xl sm:text-2xl font-semibold'>Bank Accounts</h1>
        
        {/* Mobile Button Layout */}
        <div className='flex flex-col sm:hidden gap-2'>
          <button className='flex cursor-pointer bg-blue-500 hover:bg-blue-600 transition-all duration-300 items-center justify-center gap-2 p-2 rounded-md'>
            <RotateCw size={16} className='text-white'></RotateCw>
            <span className='text-white text-sm'>Reset All Balances</span>
          </button>
          <button onClick={()=>handleOpenForm()} className='flex cursor-pointer bg-blue-500 hover:bg-blue-600 transition-all duration-300 items-center justify-center gap-2 p-2 rounded-md'>
            <Plus size={16} className='text-white'></Plus>
            <span className='text-white text-sm'>Add Account</span>
          </button>
        </div>
        
        {/* Desktop Button Layout */}
        <div className='hidden sm:flex items-center gap-2'>
          <button className='flex cursor-pointer bg-blue-500 hover:bg-blue-600 transition-all duration-300 items-center gap-2 p-2 rounded-md'>
            <RotateCw size={18} className='text-white'></RotateCw>
            <span className='text-white'>Reset All Balances</span>
          </button>
          <button onClick={()=>handleOpenForm()} className='flex cursor-pointer bg-blue-500 hover:bg-blue-600 transition-all duration-300 items-center gap-2 p-2 rounded-md'>
            <Plus size={18} className='text-white'></Plus>
            <span className='text-white'>Add Account</span>
          </button>
        </div>
      </div>

      {/* Bank Accounts List */}
      <div className='overflow-scroll h-48 sm:h-64 flex flex-col gap-2'>
        {
          bankAccounts.map((acc, index) => (
          <div key={index} className='flex w-full p-2 sm:p-3 rounded-md bg-gray-50 border border-neutral-200 justify-between items-center'>
            <div className='flex flex-col gap-1 min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
              <h1 className='text-sm sm:text-base font-medium truncate'>{acc.account_holdername}</h1>
              {
                acc.is_default && (
                  <span className='text-xs bg-green-100 p-1 rounded-md sm:text-sm text-green-500'>Default</span>
                )
              }
              </div>
              <span className='font-bold text-sm sm:text-base'>{convertIntoRupees(acc.current_balance)}</span>
            </div>
            <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
              <button onClick={()=>handleOpenForm(acc)} className='p-1.5 sm:p-2 rounded-md cursor-pointer border border-neutral-200 hover:bg-gray-100 transition-colors'>
                <Pencil size={14} className='sm:w-4 sm:h-4'></Pencil>
              </button>
              <button className='p-1.5 sm:p-2 rounded-md cursor-pointer border border-neutral-200 hover:bg-gray-100 transition-colors'>
                <Trash size={14} className='sm:w-4 sm:h-4'></Trash>
              </button>
              <button className='p-1.5 sm:p-2 rounded-md cursor-pointer border border-neutral-200 hover:bg-gray-100 transition-colors'>
                <RotateCw size={14} className='sm:w-4 sm:h-4'></RotateCw>
              </button>
            </div>
          </div>
          ))
        }
      </div>

      {/* Total Balance */}
      <div className='flex items-center justify-between p-2 sm:p-3 bg-gray-100 rounded-md'>
        <span className='text-base sm:text-lg font-medium'>Total Balance</span>
        <span className='text-lg sm:text-xl font-semibold'>{convertIntoRupees(totalBalance)}</span>
      </div>
    </div>
  )
}

export default BankAccount