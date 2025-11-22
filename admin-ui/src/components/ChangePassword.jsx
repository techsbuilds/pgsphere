import React, {useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../validations/changePasswordSchema";
import { useForm } from "react-hook-form";
import { changePassword } from "../services/adminService";


//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";



function ChangePassword({onClose}) {
  const [loading, setLoading] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password:'',
      confirm_password:'',
      current_password:''
    },
  });

  const handleChangePassword = async (formData) =>{
    setLoading(true)
    try{
        const data = await changePassword(formData)
        toast.success("Password changed successfully.")
        onClose(true)
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoading(false)
    }
  }

  return (
    <div className="fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto">
        <div className="flex w-full max-w-xl flex-col gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 sm:p-6 my-auto">
          <div className="flex items-center gap-2">
          <ChevronLeft
            size={24}
            onClick={() => onClose(false)}
            className="cursor-pointer sm:w-7 sm:h-7"
          ></ChevronLeft>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
            Change Password
          </h1>
          </div>
          <form onSubmit={handleSubmit(handleChangePassword)} className="flex flex-col gap-3 sm:gap-4"
          >
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-sm sm:text-base">
                    Current Password <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col">
                    <input 
                    type="password"
                    {...register('current_password')}
                    placeholder="Enter current password"
                    className="p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                    ></input>
                    {
                     errors.current_password && 
                     <span className="text-xs sm:text-sm text-red-500">{errors.current_password.message}</span>
                    }
                </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-sm sm:text-base">
                    New Password <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col">
                    <input 
                    type="password"
                    {...register("password")}
                    placeholder="Enter new password"
                    className="p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                    ></input>
                    {
                     errors.password && 
                     <span className="text-xs sm:text-sm text-red-500">{errors.password.message}</span>
                    }
                </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-sm sm:text-base">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col">
                    <input 
                    type="password"
                    {...register("confirm_password")}
                    placeholder="Enter confirm Password"
                    className="p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                    ></input>
                    {
                     errors.confirm_password && 
                     <span className="text-xs sm:text-sm text-red-500">{errors.confirm_password.message}</span>
                    }
                </div>
            </div>
            <div className="flex justify-center items-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 sm:p-3 hover:bg-primary/90 disabled:cursor-not-allowed w-full sm:w-40 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white text-sm sm:text-base font-medium"
            >
              {loading ? (
                <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6"></LoaderCircle>
              ) : "Change Password"}
            </button>
          </div>
          </form>
        </div>
    </div>
  )
}

export default ChangePassword