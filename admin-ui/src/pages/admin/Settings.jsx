import React, {useEffect, useState} from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { toast } from 'react-toastify'
import { getAllBranch } from '../../services/branchService'
import { generateLink } from '../../services/authService'
import { sliceString, parseTime } from '../../helper'

//Import icons
import { Copy, Check, LoaderCircle } from 'lucide-react';
import { getMealConfig, updateMealConfig } from '../../services/mealService'

const convertTimesToBackend = (times) => {
  const formatTime = ({ hour, minute, period }) => {
    // Remove leading zero (for example: "04" -> "4")
    const h = hour.startsWith('0') ? hour.slice(1) : hour;
    // If minute is "00", return without minutes (e.g., "12pm")
    if (minute === '00') return `${h}${period.toLowerCase()}`;
    return `${h}:${minute}${period.toLowerCase()}`;
  };

  return {
    breakfast_time: formatTime(times.breakfast),
    lunch_time: formatTime(times.lunch),
    dinner_time: formatTime(times.dinner),
  };
};

function Settings() {
  const [branches, setBranches] = useState([])
  const [selectBranch, setSelectBranch] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [mealLoader, setMealLoader] = useState(false)
  const [loader, setLoader] = useState(false)
  const [copied, setCopied] = useState(false);
  const [mealConfig, setMealConfig] = useState(null)
  
  const [times, setTimes] = useState({
    breakfast: { hour: '08', minute: '00', period: 'AM' },
    lunch: { hour: '12', minute: '00', period: 'PM' },
    dinner: { hour: '08', minute: '00', period: 'PM' },
  });

  const handleTimeChange = (meal, field, value) => {
    setTimes((prev) => ({
      ...prev,
      [meal]: { ...prev[meal], [field]: value },
    }));
  };

  useEffect(()=>{
    const handleFetchBranch = async () =>{
      try{
        const data = await getAllBranch()
        setBranches(data)
      }catch(error){
        console.log(error)
        toast.error(error?.message)
      }
    }
    handleFetchBranch()
  },[])

  const handleGenerateLink = async () => {
    setLoader(true)
    try{
      if(!selectBranch){
        toast.error("Please select a branch")
        return
      }
      const data = await generateLink(selectBranch)
      setGeneratedLink(data)
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }finally{
      setLoader(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);

      // Reset icon after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const handleGetMealConfig = async () =>{
    try{
      const data = await getMealConfig()
      console.log(parseTime(data.breakfast_time))
      console.log(parseTime(data.lunch_time))
      console.log(parseTime(data.dinner_time))

      setTimes({
        breakfast: parseTime(data.breakfast_time),
        lunch: parseTime(data.lunch_time),
        dinner: parseTime(data.dinner_time),
      })
      setMealConfig(data)
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }
  }

  useEffect(()=>{
    handleGetMealConfig()
  },[])

  const renderTimePicker = (meal) => (
    <div className='flex items-center gap-1.5 sm:gap-2 flex-shrink-0'>
      {/* Hour */}
      <select
        value={times[meal].hour}
        onChange={(e) => handleTimeChange(meal, 'hour', e.target.value)}
        className='border border-neutral-300 rounded-md px-2 py-1.5 sm:py-1 text-xs sm:text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      >
        {[...Array(12)].map((_, i) => {
          const val = (i + 1).toString().padStart(2, '0');
          return (
            <option key={val} value={val}>
              {val}
            </option>
          );
        })}
      </select>

      <span className='text-gray-500 text-xs sm:text-sm'>:</span>

      {/* Minute */}
      <select
        value={times[meal].minute}
        onChange={(e) => handleTimeChange(meal, 'minute', e.target.value)}
        className='border border-neutral-300 rounded-md px-2 py-1.5 sm:py-1 text-xs sm:text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      >
        {['00', '15', '30', '45'].map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* AM/PM */}
      <select
        value={times[meal].period}
        onChange={(e) => handleTimeChange(meal, 'period', e.target.value)}
        className='border border-neutral-300 rounded-md px-2 py-1.5 sm:py-1 text-xs sm:text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      >
        <option value='AM'>AM</option>
        <option value='PM'>PM</option>
      </select>
    </div>
  );

  const handleUpdateMealConfig = async () =>{
     setMealLoader(true)
     try{
       const payload = convertTimesToBackend(times)
       const data = await updateMealConfig(mealConfig._id,payload)
       handleGetMealConfig()
       toast.success("Meal configuration updated successfully")
     }catch(err){
       console.log(err)
       toast.error(err?.message)
     }finally{
      setMealLoader(false)
     }
  }



  return (
    <div className='flex flex-col h-full gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0'>
       <Breadcrumb></Breadcrumb>
       <div className='rounded-xl sm:rounded-2xl bg-white shadow-sm flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 w-full'>
         <div className='flex flex-col gap-1 sm:gap-0.5'>
           <h1 className='text-base sm:text-lg font-medium'>Generat Customer Portal Link</h1>
           <span className='text-[#737373] text-xs sm:text-sm'>Create a signup link for your customers. Select a branch to generate the unique portal link.</span>
         </div>
         <div className='flex flex-col gap-1 sm:gap-2'>
           <label className='font-medium text-sm sm:text-base'>Select Branch</label>
           <select onChange={(e)=>setSelectBranch(e.target.value)} className='p-2.5 sm:p-2 w-full sm:w-72 text-sm text-[#737373] rounded-md border border-neutral-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
              <option value={''}>Choose a Branch</option>
              {
                branches.map((branch)=>(
                  <option key={branch._id} value={branch._id}>{branch.branch_name}</option>
                ))
              }
           </select>
         </div>
        <button onClick={handleGenerateLink} disabled={loader} className={`w-full sm:w-48 ${selectBranch ? "bg-[#202947] cursor-pointer hover:bg-[#2a3457]" : "bg-gray-500 cursor-not-allowed"} transition-all duration-300 text-white py-2.5 sm:py-2 rounded-md text-sm sm:text-base font-medium`}>
          {loader ? <LoaderCircle className='animate-spin mx-auto' size={20} /> : 'Generate Link'}
        </button>
        {
          generatedLink && 
          <div className='rounded-xl sm:rounded-2xl flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 border border-neutral-300 bg-[#fafafa]'>
          <h1 className='font-semibold text-base sm:text-lg'>Portal Link Generated</h1>
          <div className='flex w-full items-stretch sm:items-center gap-2'>
            <div className='p-2.5 sm:p-2 flex-1 rounded-md bg-white border border-neutral-300 min-w-0'>
              <span className='text-xs sm:text-sm break-all'>{sliceString(generatedLink, 120)}</span>
            </div>
    
            {/* Copy Button */}
            <div
              onClick={handleCopy}
              className={`rounded-md border border-neutral-300 cursor-pointer p-2.5 sm:p-2 bg-white transition-all duration-200 flex-shrink-0 ${
                copied ? 'bg-green-100 border-green-400' : 'hover:bg-gray-100'
              }`}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? (
                <Check size={20} className='sm:w-[22px] sm:h-[22px] text-green-500' />
              ) : (
                <Copy size={20} className='sm:w-[22px] sm:h-[22px] text-gray-700' />
              )}
            </div>
          </div>
  
        </div>
        }
       </div>
       <div className='rounded-xl sm:rounded-2xl bg-white shadow-sm flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 w-full'>
         <div className='flex mb-1 sm:mb-2 flex-col gap-0.5 sm:gap-1'>
           <h1 className='text-base sm:text-lg font-medium'>Meal Cancellation Configuration</h1>
           <span className='text-[#737373] text-xs sm:text-sm'>Set the cancellation deadline time for each meal type. Customers can cancel their meal orders before this time.</span>
         </div>
         <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-300'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4'>
             <div className='flex flex-col gap-1 flex-1'>
               <h1 className='text-sm sm:text-base font-medium'>Breakfast Cancellation Deadline</h1>
               <span className='text-xs sm:text-sm text-[#737373]'>Set the time before which customers can cancel their breakfast</span>
             </div>
             {renderTimePicker('breakfast')}
          </div>
         </div>
         <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-300'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4'>
             <div className='flex flex-col gap-1 flex-1'>
               <h1 className='text-sm sm:text-base font-medium'>Lunch Cancellation Deadline</h1>
               <span className='text-xs sm:text-sm text-[#737373]'>Set the time before which customers can cancel their lunch</span>
             </div>
             {renderTimePicker('lunch')}
          </div>
         </div>
         <div className='p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-300'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4'>
             <div className='flex flex-col gap-1 flex-1'>
               <h1 className='text-sm sm:text-base font-medium'>Dinner Cancellation Deadline</h1>
               <span className='text-xs sm:text-sm text-[#737373]'>Set the time before which customers can cancel their dinner</span>
             </div>
             {renderTimePicker('dinner')}
          </div>
         </div>
         <button 
         onClick={handleUpdateMealConfig}
         disabled={mealLoader}
         className='w-full sm:w-52 flex justify-center items-center bg-[#202947] cursor-pointer p-2.5 sm:p-2 transition-all duration-300 text-white py-2.5 sm:py-2 rounded-md text-sm sm:text-base font-medium hover:bg-[#2a3457] disabled:opacity-50 disabled:cursor-not-allowed'>
          {
            mealLoader ? 
            <LoaderCircle className='animate-spin' size={20} />
            :"Save Meal Configuration"
          }
         </button>
       </div>
    </div>
  )
}

export default Settings