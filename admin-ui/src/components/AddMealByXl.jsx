import React, { useEffect, useState, useRef } from 'react'
import MultiSelectDropdown from './MultiSelectDropdown'

//Importing icons
import { ChevronLeft, Download, File ,LoaderCircle, X } from 'lucide-react'
import UPLOAD from '../assets/upload.png'
import { toast } from 'react-toastify'
import { getAllBranch } from '../services/branchService'
import { createMealByXl } from '../services/mealService'

function AddMealByXl({openForm, onClose }) {
  const [branches,setBranches] = useState([])
  const [selectedBranches,setSelectedBranches] = useState([])
  const [loader, setLoader] = useState(false)
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();
  const [fileError,setFileError] = useState('')
  const [branchError,setBranchError] = useState('')
  
  useEffect(()=>{
    const handleGetAllBranch = async ()=>{
      try{
         const data = await getAllBranch()
         setBranches(
            data.map((item) => ({ label: item.branch_name, value: item._id }))
          );
      }catch(err){
         console.log(err)
         toast.error(err?.message)
      }
    }
 
    handleGetAllBranch()
   },[])


  if(!openForm) return null

  const handleFile = (file) => {
    if (!file) return;

    const allowedExtensions = ["xlsx", "xls", "csv"];
    const fileExt = file.name.split(".").pop();

    if (!allowedExtensions.includes(fileExt)) {
      toast.error("Please upload only Excel files (.xlsx, .xls, .csv)");
      return;
    }

    setFile(file);
    setBranchError('')

  };

  const handleSelectBranch = (branches) =>{
     if(branches.length === 0){
      setBranchError('Please select at least 1 branch.')
     }else{
      setBranchError('')
     }
     setSelectedBranches(branches)
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowse = (e) => {
    handleFile(e.target.files[0]);
  };

  const validateData = () =>{
    let isValid = true
    if(file===null) {
      setFileError('Please upload an Excel file.')
      isValid = false
    }
    if(selectedBranches.length===0){
      setBranchError('Please select at least one branch.')
      isValid = false
    } 
    return isValid
  }

  const handleImportMeal = async () => {
    console.log('run')
    if(!validateData()) return 
    console.log('out')
    setLoader(true)
    try{
      const formData = new FormData()
      formData.append('meal_excel', file)
      for(let branch of selectedBranches){
        formData.append('branch',branch)
      }
      const data = await createMealByXl(formData)
      handleClose(true)
    }catch(err){
      console.log(err)
      toast.error(err?.message) 
    }finally{
        setLoader(false)
    }
  }

  const handleRemoveFile = () =>{
    setFile(null)
  }

  const handleClose = (refresh) =>{
    setFile(null)
    setSelectedBranches([])
    setFileError('')
    setBranchError('')
    onClose(refresh)
  }

  return (
    <div className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-1.5 sm:p-3 md:p-4 lg:p-6' onClick={()=>onClose(false)}>
        <div onClick={(e) => e.stopPropagation()} className='flex w-full max-w-2xl flex-col gap-2.5 sm:gap-3 md:gap-4 bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-2.5 sm:p-3 md:p-4 lg:p-6 max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-y-auto'>
         <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <ChevronLeft 
            size={18} 
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 cursor-pointer flex-shrink-0" 
            onClick={() => handleClose(false)}
          />
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold truncate">
            Add Meal by Excel File
          </h1>
         </div>
         <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='w-full border rounded-xl sm:rounded-2xl border-primary p-2.5 sm:p-3 md:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 sm:gap-3 md:gap-4'>
               <div className='flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0'>
                  <span className='p-1.5 sm:p-2 text-white rounded-xl sm:rounded-2xl bg-primary flex-shrink-0'>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5"></Download>
                  </span>
                  <div className='flex flex-col min-w-0 flex-1'>
                    <h1 className='text-xs sm:text-sm md:text-base font-medium truncate'>Sample Excel Template</h1>
                    <p className='text-[10px] sm:text-xs md:text-sm text-[#737373] line-clamp-2'>Download the template to see the required format</p>
                  </div>
               </div>
               <button 
               onClick={()=> {
                const link = document.createElement('a');
                link.href = '/sample-meal.xlsx'
                link.download = 'sample.xlsx'
                link.click()
               }}
               className='p-1.5 sm:p-2 cursor-pointer px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2 bg-primary rounded-lg sm:rounded-xl sm:w-auto justify-center'>
                  <Download className='text-white w-4 h-4 sm:w-5 sm:h-5'></Download>
                  <span className='text-white text-xs sm:text-sm font-light'>Download</span>
               </button>
            </div>
            <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className='text-xs sm:text-sm font-medium'>Upload Excel File <span className='text-red-500'>*</span></label>
                {
                file ? 
                <div className='border-2 flex justify-between items-center border-dashed border-primary p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl gap-2'>
                   <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
                     <span className='p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-primary flex-shrink-0'>
                       <File className='w-4 h-4 sm:w-5 sm:h-5 text-white'></File>
                     </span>
                     <div className='flex flex-col min-w-0 flex-1'>
                       <h1 className='font-medium text-xs sm:text-sm md:text-base truncate'>{file.name}</h1>
                       <span className='text-[10px] sm:text-xs text-[#737373]'>{(file.size/1000).toFixed(1)} KB</span>
                     </div>
                   </div>
                   <span 
                   onClick={handleRemoveFile}
                   className='hover:text-red-500 cursor-pointer transition-all duration-300 flex-shrink-0' 
                   >
                    <X className="w-4 h-4 sm:w-5 sm:h-5"></X>
                   </span>
                </div>
                :
               <div className='flex flex-col'>
                 <div 
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
                 onClick={() => inputRef.current.click()}
                 className={`border-2 cursor-pointer transition-all duration-300 border-gray-200 ${dragActive ? "border-primary" : "border-gray-200"} hover:border-primary border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col gap-1.5 sm:gap-2 justify-center items-center`}>
                    <div className='bg-gray-100 p-3 sm:p-4 rounded-full'>
                        <img className='w-6 h-6 sm:w-8 sm:h-8' src={UPLOAD} alt="Upload"></img>
                    </div>
                    <div className='flex justify-center items-center flex-col gap-0.5 sm:gap-1 text-center'>
                      <h1 className='text-xs sm:text-sm md:text-base font-medium'>Drag & drop your Excel file here</h1>
                      <span className='text-[10px] sm:text-xs md:text-sm text-[#737373]'>or click to browse</span>
                      <span className='bg-[#f5f5f5] text-[10px] sm:text-xs text-[#737373] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-light mt-0.5'>Supports .xlsx,.xls files</span>
                    </div>
                    <input
                    type='file'
                    accept='.xlsx, .xls, .csv'
                    ref={inputRef}
                    onChange={handleBrowse}
                    className='hidden'
                    >
                    </input>
                 </div>
                 {fileError && <span className='text-xs sm:text-sm text-red-500 mt-0.5'>{fileError}</span>}
               </div>
                }
            </div>
            <div className='flex flex-col gap-1.5 sm:gap-2'>
                <label className='text-xs sm:text-sm font-medium'>Select Branch <span className='text-red-500'>*</span></label>
                <div className='flex flex-col'>
                 <MultiSelectDropdown
                    options={branches}
                    selected={selectedBranches} // controlled by RHF
                    onChange={(val) => handleSelectBranch(val)} // update RHF state
                    placeholder="--Select Branch--"
                 />
                 {branchError && <span className='text-xs sm:text-sm text-red-500 mt-0.5'>{branchError}</span>}
                </div>
            </div>
         </div>
         <div className="flex sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="flex-1 p-2 sm:p-2.5 md:p-3 border border-neutral-300 rounded-lg sm:rounded-md text-xs sm:text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportMeal}
              disabled={loader}
              className="flex-1 p-2 sm:p-2.5 md:p-3 bg-primary text-white rounded-lg sm:rounded-md text-xs sm:text-sm md:text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
            >
              {loader ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Saving...</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">Import Meal</span>
              )}
            </button>
          </div>
        </div>
    </div>
  )
}

export default AddMealByXl