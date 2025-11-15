import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { scannerSchema } from "../validations/scannerSchema"
import { getAllBankAccount } from '../services/bankAccountService';
import { getAllBranch } from "../services/branchService";
import { useForm, Controller } from "react-hook-form";
import UploadImage from "./UploadImage";
import MultiSelectDropdown from "./MultiSelectDropdown";

//Importing icons
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";

import { createScanner, updateScanner } from "../services/scannerServices";

function ScannerForm({ selectedScanner, onClose }) {

    console.log('selectedScanner', selectedScanner)
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [bankAccounts, setBankAccounts] = useState([])
    const [branches, setBranches] = useState([])
    const [selectedBankAccount, setSelectedBankAccount] = useState('')
    const [imageError, setImageError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        watch
    } = useForm({
        mode: "onChange",
        resolver: zodResolver(scannerSchema),
        defaultValues: {
            bankaccount: '',
            branch: []
        }
    });
    const handleGetBankAccounts = async () => {
        try {
            const data = await getAllBankAccount()
            setBankAccounts(data)
        } catch (err) {
            console.log(err)
            toast.error(err?.message)
        }
    }
    const handleGetBranches = async () => {
        try {
            const data = await getAllBranch()
            setBranches(
                data.map((item) => ({ label: item.branch_name, value: item._id }))
            );
        } catch (err) {
            console.log(err)
            toast.error(err?.message)
        }
    }

    useEffect(() => {
        handleGetBankAccounts()
        handleGetBranches()
    }, [])

    useEffect(() => {
        if (selectedScanner) {
            setPreviewImage(selectedScanner?.sc_image)
            reset({
                bankaccount: selectedScanner.bankaccount?._id,
                branch: selectedScanner.branch.map((item) => item._id) || ""
            })
            setSelectedBankAccount(selectedScanner.bankaccount?._id)
        } else {
            setPreviewImage(null)
            reset({
                bankaccount: '',
                branch: []
            })
            setSelectedBankAccount('')
        }
    }, [selectedScanner])

    const handleAddScanner = async (formData) => {
        if (!file) {
            setImageError("Please upload a scanner image.")
            return
        }
        else {
            setImageError("")
        }
        try {
            setLoading(true)
            const fileData = new FormData()
            if (file) fileData.append('scanner', file)
            fileData.append('bankaccount', formData.bankaccount)
            for (let i = 0; i < formData.branch.length; i++) {
                fileData.append('branch', formData.branch[i])
            }
            const data = await createScanner(fileData)
            onClose(true)
            toast.success("New Scanner added successfully.")
        } catch (error) {
            console.log(error)
            console.log("eror add scanner ma che ")
            toast.error(error?.message)
        } finally {
            setLoading(false)
        }
    };

    const handleUpdateScanner = async (formData) => {

        if (!previewImage) {
            setImageError("Please upload a scanner image.")
            return
        }
        else {
            setImageError("")
        }
        console.log('formData', formData)
        try {
            setLoading(true)
            let fileData = new FormData()

            fileData.append('bankaccount', formData.bankaccount)
            for (let i = 0; i < formData.branch.length; i++) {
                fileData.append('branch', formData.branch[i])
            }

            if (file) {
                fileData.append('scanner', file)
            }

            const data = await updateScanner(fileData, selectedScanner?._id)
            onClose(true)
            toast.success("Scanner updated successfully.")
        } catch (err) {
            console.log(err)
            toast.error(err?.message)
        } finally {
            setLoading(false)
        }
    }

    console.log(errors)
    return (
        <div
            className="fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6"
            onClick={() => onClose(false)}
        >
            <div
                className="flex w-full max-w-md lg:max-w-lg flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2">
                    <ChevronLeft size={24} className="sm:w-7 sm:h-7 cursor-pointer" onClick={() => onClose(false)}></ChevronLeft>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">{selectedScanner ? "Edit Scanner" : "Add New Scanner"}</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <UploadImage className={'mt-2'} file={file} setFile={setFile} previewImage={selectedScanner ? selectedScanner?.sc_image : null} setPreviewImage={setPreviewImage} ></UploadImage>
                    {imageError && <span className='text-xs sm:text-sm text-red-500'>{imageError}</span>}
                </div>
                <form
                    onSubmit={handleSubmit(selectedScanner ? handleUpdateScanner : handleAddScanner)}
                    className="flex flex-col gap-3 sm:gap-4"
                >

                    <div className='flex flex-col gap-1'>
                        <label>Select Bank Account <span className='text-red-500 text-sm'>*</span></label>
                        <div className='flex flex-col'>
                            <select
                                {...register('bankaccount')}
                                value={selectedBankAccount}
                                onChange={(e) => setSelectedBankAccount(e.target.value)}
                                className='p-2 border border-neutral-300 rounded-md outline-none'>
                                <option value={''}>-- Select Bank Account --</option>
                                {
                                    bankAccounts.map((item, index) => (
                                        <option value={item._id} key={index}>{item.account_holdername}</option>
                                    ))
                                }

                            </select>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label>Select Branch <span className='text-red-500 text-sm'>*</span></label>
                        <div className='flex flex-col'>
                            <Controller
                                name="branch"
                                control={control}
                                render={({ field }) => (
                                    <MultiSelectDropdown
                                        options={branches}
                                        selected={field.value || []} // controlled by RHF
                                        onChange={(val) => field.onChange(val)} // update RHF state
                                        placeholder="--Select Branch--"
                                    />
                                )}
                            />
                            {errors.branch && (
                                <span className="text-xs sm:text-sm text-red-500 mt-1">
                                    {errors.branch.message}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-center items-center">
                        <button type="submit" disabled={loading} className="p-2 hover:bg-blue-600 w-full sm:w-36 transition-all duration-300 cursor-pointer flex justify-center items-center bg-blue-500 rounded-md text-white font-medium text-sm sm:text-base">
                            {
                                loading ?
                                    <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5"></LoaderCircle> :
                                    selectedScanner ?
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

export default ScannerForm;
