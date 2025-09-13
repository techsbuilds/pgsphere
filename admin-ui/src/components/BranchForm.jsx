import React, {useEffect, useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema } from "../validations/branchSchema";
import { useForm } from "react-hook-form";
import UploadImage from "./UploadImage";

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

import { createBranch, updateBranch } from "../services/branchService";

function BranchForm({selectedBranch, onClose}) {
  const [file, setFile] = useState(null);
  const [previewImage,setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branch_name:'',
      branch_address:''
    }
  });

  useEffect(()=>{
     if(selectedBranch){
      setPreviewImage(selectedBranch?.branch_image)
      reset({
        branch_name:selectedBranch.branch_name || "",
        branch_address:selectedBranch.branch_address || ""
      })
     }
  },[selectedBranch])

  const handleAddBranch = async (formData) => {
    try{
      setLoading(true)
      const fileData = new FormData()
      if(file) fileData.append('image',file)
      fileData.append('branch_name',formData.branch_name)
      fileData.append('branch_address',formData.branch_address)

      const data = await createBranch(fileData)

      onClose(true)
      toast.success("New Branch added successfully.")
    }catch(error){
      console.log(error)
      toast.error(error?.message)
    }finally{
      setLoading(false)
    }
  };

  const handleUpdateBranch = async (formData) =>{
     try{
      setLoading(true)
      let fileData = new FormData()

      fileData.append('branch_name',formData.branch_name)
      fileData.append('branch_address',formData.branch_address)

      if(file) {
        fileData.append('image',file)
      }
      
      if(!file && !previewImage){
        fileData.append('remove_image',true)
      }

      const data = await updateBranch(fileData, selectedBranch?._id)
      onClose(true)
      toast.success("Branch updated successfully.")
     }catch(err){
      console.log(err)
      toast.error(err?.message)
     }finally{
      setLoading(false)
     }
  }

  return (
    <div className="fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4">
      <div className="flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2">
          <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer" onClick={()=>onClose(false)}></ChevronLeft>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">{selectedBranch ?"Edit Branch": "Add New Branch"}</h1>
        </div>
        <UploadImage className={'mt-2'} file={file} setFile={setFile} previewImage={selectedBranch ? selectedBranch?.branch_image : null} setPreviewImage={setPreviewImage} ></UploadImage>
        <form
          onSubmit={handleSubmit(selectedBranch ? handleUpdateBranch : handleAddBranch)}
          className="flex flex-col gap-3 sm:gap-4"
        >
          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-sm sm:text-base">
              Branch Name <span className="text-sm text-red-500">*</span>
            </label>
            <div className="flex flex-col">
              <input
                type="text"
                {...register("branch_name")}
                className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base"
                placeholder="Enter branch name"
              ></input>
              {errors.branch_name && <span className="text-xs sm:text-sm text-red-500">{errors.branch_name.message}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-sm sm:text-base">
              Address <span className="text-sm text-red-500">*</span>
            </label>
           <div className="flex flex-col">
            <textarea
               {...register("branch_address")}
               className="p-2 sm:p-3 border border-neutral-300 resize-none rounded-md outline-none text-sm sm:text-base"
               placeholder="Enter branch address"
               rows={3}
             ></textarea> 
             {errors.branch_address && <span className="text-xs sm:text-sm text-red-500">{errors.branch_address.message}</span>}
           </div>
          </div>
          <div className="flex justify-center items-center">
             <button type="submit" disabled={loading} className="p-2 sm:p-3 hover:bg-blue-600 w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-blue-500 rounded-md text-white font-medium text-sm sm:text-base">
                {
                  loading ? 
                  <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></LoaderCircle> :
                  selectedBranch ? 
                  "Save" :
                  "Submit"
                }
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BranchForm;
