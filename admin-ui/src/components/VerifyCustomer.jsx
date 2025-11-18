import React, {useEffect, useState} from "react";
import { verifyCustomerSchema } from "../validations/verifyCustomerSchema";
import { getAllBankAccount } from "../services/bankAccountService";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { verifyCustomerAccount } from "../services/customerService";

//Import helper
import { capitalise, sliceString } from "../helper";

//Import icons
import {
  ChevronLeft,
  UserRound,
  Phone,
  Mail,
  BedSingle,
  Building2,
} from "lucide-react";

function VerifyCustomer({ openForm, customer, onClose }) {
  const [bankAccounts,setBankAccounts] = useState([])
  const [loader,setLoader] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(verifyCustomerSchema),
    defaultValues:{
        rent_amount:0,
        deposite_amount:0,
        variable_deposite_amount:0,
        bank_account:'',
        payment_mode:''
    }
  });

  useEffect(()=>{
    const handleGetAllBankAccounts = async ()=>{
        try{
          const data = await getAllBankAccount()
          setBankAccounts(data)
        }catch(err){
          console.log(err)
          toast.error(err?.message)
        }
    }

    handleGetAllBankAccounts()
  },[])

  const handleVerifyAccount = async (formData) =>{
    setLoader(true)
    try{
        const data = await verifyCustomerAccount(customer?._id,formData)
        toast.success("Customer account verified successfully.")
        onClose(true)
    }catch(err){
        console.log(err)
        toast.error(err?.message)
    }finally{
        setLoader(false)
    }
  }

  if (!openForm) return null;

  return (
    <div className="fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6">
      <div className="flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4">
        <div className="flex items-center gap-2">
          <ChevronLeft
            size={24}
            className="sm:w-7 sm:h-7 cursor-pointer"
            onClick={() => onClose(false)}
          ></ChevronLeft>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
            Verify Customer Account
          </h1>
        </div>
        <div className="flex flex-col max-h-[90vh] overflow-y-scroll gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-medium">Aadhar Card</h1>
            <img
              src={customer.aadharcard_url}
              alt="aadhar card"
              className="w-full h-72"
            ></img>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <label>
                <UserRound></UserRound>
              </label>
              <span className="text-[16px]">
                {capitalise(customer?.customer_name)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label>
                <Phone></Phone>
              </label>
              <span className="text-[16px]">
                +91 {customer?.mobile_no || "-"}
              </span>
            </div>
            <div className="flex items-center col-span-2 gap-2">
              <label>
                <Mail></Mail>
              </label>
              <span className="text-[16px]">{customer?.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <label>
                <BedSingle></BedSingle>
              </label>
              <span className="text-[16px]">
                Room {customer?.room?.room_id || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label>
                <Building2></Building2>
              </label>
              <span className="text-[16px]">
                Branch {sliceString(customer?.branch?.branch_name, 20)}
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit(handleVerifyAccount)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label>
                Rent Amount <span className="text-sm text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  {...register("rent_amount",{ valueAsNumber: true })}
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                  placeholder="Enter Rent Amount"
                ></input>
                {errors.rent_amount && <span className="text-sm text-red-500">{errors.rent_amount.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
             <div className="flex flex-col gap-2">
              <label>
               Fixed Deposite Amount <span className="text-sm text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  {...register("deposite_amount",{ valueAsNumber: true })}
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none "
                  placeholder="Enter Deposite Amount"
                ></input>
                {errors.deposite_amount && <span className="text-sm text-red-500">{errors.deposite_amount.message}</span>}
              </div>
             </div>
             <div className="flex flex-col gap-2">
              <label>Pay Deposite Amount <span className="text-sm text-red-500">*</span></label>
              <div className="flex flex-col">
                <input
                  {...register("variable_deposite_amount",{ valueAsNumber: true })}
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none "
                  placeholder="Enter Variable Deposite Amount"
                ></input>
              </div>
              {errors.variable_deposite_amount && <span className="text-sm text-red-500">{errors.variable_deposite_amount.message}</span>}
             </div>
            </div>
            <div className="grid mb-2 grid-cols-2 gap-4 items-center">
              <div className="flex flex-col gap-2">
                <label>
                  Bank Account <span className="text-sm text-red-500">*</span>
                </label>
                <div className="flex flex-col">
                  <select 
                  {...register("bank_account")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ">
                    <option value={""}>--- Select Bank Account ---</option>
                    {
                       bankAccounts.map((item, index) => (
                        <option value={item._id} key={index}>{item.account_holdername}</option>
                       ))
                     }
                  </select>
                  {errors.bank_account && <span className="text-sm text-red-500">{errors.bank_account.message}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Payment Mode</label>
                <div className="flex flex-col">
                  <select 
                   {...register("payment_mode")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none ">
                    <option value={""}>--- Select Payment Mode ---</option>
                    <option value={"cash"}>Cash</option>
                    <option value={"upi"}>UPI</option>
                    <option value={"bank_transfer"}>Bank Transfer</option>
                  </select>
                  {errors.payment_mode && <span className="text-sm text-red-500">{errors.payment_mode.message}</span>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 items-center">
            <button onClick={()=>onClose(false)} className="p-2 hover:bg-gray-100 transition-all duration-300 text-sm w-32 cursor-pointer flex justify-center items-center rounded-md border border-neutral-300">
              Cancel
            </button>
            <button disabled={loader} type="submit" className="p-2 min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white font-medium">
              {
                loader ? <LoaderCircle className="animate-spin"></LoaderCircle> : "Approve"
              }
            </button>
          </div>
          </form>
        
        </div>
      </div>
    </div>
  );
}

export default VerifyCustomer;
