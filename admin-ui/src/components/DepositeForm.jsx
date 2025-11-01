import { useState, useEffect } from "react";
import React from "react";
import { getAllBankAccount } from "../services/bankAccountService";
import { createTransactionForDepositeCollection } from "../services/transactionService";
import { depositeSchema } from "../validations/depositeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

//Import icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

function DepositeForm({ openForm, customer, onClose }) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loader, setLoader] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(depositeSchema),
    defaultValues:{
        customer:customer?._id,
        amount:0,
        bank_account:'',
        payment_mode:''
    }
  });

  useEffect(()=>{
    reset({
        customer:customer?._id,
        amount:0,
        bank_account:'',
        payment_mode:''
    })
  },[customer])


  useEffect(() => {
    const handleGetAllBankAccounts = async () => {
      try {
        const data = await getAllBankAccount();
        setBankAccounts(data);
      } catch (err) {
        console.log(err);
        toast.error(err?.message);
      }
    };

    handleGetAllBankAccounts();
  }, []);

  const handleCollectDeposite = async (data) => {
    setLoader(true)
    try {
      const response = await createTransactionForDepositeCollection(data);
      toast.success("Deposite collected successfully.");
      onClose(true)
    } catch (err) {
      console.log(err);
      toast.error(err?.message || "Something went wrong.");
    } finally{
      setLoader(false)
    }
  };

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
            Collect Deposite
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Deposite Amount</span>
              <span>₹{customer.deposite_amount}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">Pending Amount</span>
              <span>₹{customer.deposite_amount - customer.paid_deposite_amount}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit(handleCollectDeposite)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-medium">Amount to Collect</label>
              <div className="flex flex-col">
               <input
                {...register("amount", { valueAsNumber: true })}
                placeholder="Enter Amount"
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
               />
               {errors.amount && (
                <span className="text-sm text-red-500">
                    {errors.amount.message}
                </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Select Bank Account</label>
              <div className="flex flex-col">
              <select
              {...register("bank_account")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none">
                <option value="">Select Bank Account</option>
                {bankAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.account_holdername}
                  </option>
                ))}
              </select>
              {errors.bank_account && (
                <span className="text-sm text-red-500">
                    {errors.bank_account.message}
                </span>
              )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label>Payment Mode</label>
              <div className="flex flex-col">
                <select
                  {...register("payment_mode")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none "
                >
                  <option value={""}>--- Select Payment Mode ---</option>
                  <option value={"cash"}>Cash</option>
                  <option value={"upi"}>UPI</option>
                  <option value={"bank_transfer"}>Bank Transfer</option>
                </select>
                {errors.payment_mode && (
                  <span className="text-sm text-red-500">
                    {errors.payment_mode.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 items-center">
            <button onClick={()=>onClose(false)} className="p-2 hover:bg-gray-100 transition-all duration-300 text-sm w-32 cursor-pointer flex justify-center items-center rounded-md border border-neutral-300">
              Cancel
            </button>
            <button disabled={loader} type="submit" className="p-2 min-w-32 text-sm transition-all duration-300 cursor-pointer flex justify-center items-center bg-[#202947] rounded-md text-white font-medium">
              {
                loader ? 
                <LoaderCircle className="animate-spin"></LoaderCircle>
                :"Submit"
              }
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DepositeForm;
