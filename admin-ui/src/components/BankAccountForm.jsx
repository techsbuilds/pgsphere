import React, {useEffect, useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema } from "../validations/bankAccountSchema";
import { useForm } from "react-hook-form";

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { createBankAccount, updateBankAccount } from "../services/bankAccountService";

function BankAccountForm({selectedBankAccount, onClose}) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_holdername:'',
      is_default:false
    }
  });

  useEffect(()=>{
    if(selectedBankAccount){
        reset({
            account_holdername:selectedBankAccount.account_holdername,
            is_default:selectedBankAccount.is_default
        })
    }
  },[])


  const handleAddBankAccount = async (formData) =>{
     try{
        setLoading(true)
        const data = await createBankAccount(formData)
        toast.success("New bank account added successfully.")
        onClose(true)
     }catch(err){
        console.log(err)
        toast.error(errors?.message)
     }finally{
        setLoading(false)
     }
  }

  const handleEditBankAccount = async (formData) =>{
     try{
        setLoading(true)
        const data = await updateBankAccount(selectedBankAccount._id,formData)
        toast.success('Bank account details updated successfully.')
        onClose(true)
     }catch(err){
        console.log(err)
        toast.error(errors?.message)
     }finally{
        setLoading(false)
     }
  }

  return (
    <div className="fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 overflow-y-auto">
        <div className="flex w-full max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 sm:p-6 my-auto">
           <div className="flex items-center gap-2">
             <ChevronLeft size={24} onClick={()=>onClose(false)} className="cursor-pointer sm:w-7 sm:h-7"></ChevronLeft>
             <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">{selectedBankAccount ?"Edit Bank Account": "Add New Bank Account"}</h1>
           </div>
           <form onSubmit={handleSubmit(selectedBankAccount ? handleEditBankAccount : handleAddBankAccount)} className="flex flex-col gap-3 sm:gap-4">
             <div className="flex flex-col gap-1.5 sm:gap-2">
                <label className="text-sm sm:text-base">Account Holder Name <span className="text-red-500">*</span></label>
                <div className="flex flex-col">
                    <input
                    type="text"
                    {...register('account_holdername')}
                    className="p-2 sm:p-2.5 text-sm sm:text-base border border-neutral-300 rounded-md outline-none"
                    placeholder="Enter account holder name" 
                    ></input>
                    {errors.account_holdername && <span className="text-xs sm:text-sm text-red-500">{errors.account_holdername.message}</span>}
                </div>
             </div>
             {
               selectedBankAccount && (
                  <div className="flex items-center gap-2">
                  <input
                   type="checkbox"
                   {...register('is_default')}
                   className="w-4 h-4 sm:w-5 sm:h-5 border border-neutral-300 rounded outline-none cursor-pointer"
                   ></input>
                   <label className="text-sm sm:text-base">Is Default</label>
                  </div>
               )
             }

             <div className="flex justify-center items-center pt-2">
             <button type="submit" disabled={loading} className="p-2.5 sm:p-3 hover:bg-primary/90 disabled:cursor-not-allowed w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white text-sm sm:text-base font-medium">
                {
                  loading ? 
                  <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6"></LoaderCircle> :
                  selectedBankAccount ? 
                  "Save" :
                  "Submit"
                }
             </button>
          </div>
           </form>
        </div>
    </div>
  )
}

export default BankAccountForm