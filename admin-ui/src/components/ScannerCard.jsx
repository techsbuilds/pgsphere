
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "../context/AuthContext"
import { Image, User, EllipsisVertical, Trash2, Minus, Check, UserPen, Building2 } from "lucide-react"
import { updateStatusScanner, deleteScanner } from "../services/scannerServices"
import { toast } from "react-toastify"
import ConfirmationBox from "./ConfirmationBox"

function ScannnerCard({ openForm, item, handleGetAllScanner }) {

    const { auth } = useAuth()
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [openConfirmBox, setOpenConfirmBox] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showDropdown) return
        
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        // Use a small delay to allow the dropdown click to register
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside)
        }, 100)

        return () => {
            clearTimeout(timeoutId)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const handleChangeScannerStatus = async () => {
        setLoading(true)
        setShowDropdown(false)
        try {
            const data = await updateStatusScanner(item._id)
            toast.success("Scanner status changed successfully.")
            handleGetAllScanner()
        } catch (err) {
            console.log(err)
            toast.error(err?.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = () => {
        setShowDropdown(false)
        setOpenConfirmBox(true)
    }

    const handleCloseConfirmationBox = (refresh = false) => {
        setOpenConfirmBox(false)
        if (refresh) {
            handleGetAllScanner()
        }
    }

    const handleConfirmDelete = async () => {
        setLoading(true)
        try {
            const data = await deleteScanner(item._id)
            toast.success("Scanner deleted successfully.")
            handleCloseConfirmationBox(true)
        } catch (err) {
            console.log(err)
            toast.error(err?.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = () => {
        setShowDropdown(false)
        openForm(item)
    }
    const getStatusColor = (status) => {
        return status === 'active' ? 'bg-green-400' : 'bg-red-400'
    }

    const capitalizeStatus = (status) => {
        if (!status) return ''
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const getBranchesDisplay = (branch) => {
        if (!branch) return "N/A"
        
        // Handle array of branches
        if (Array.isArray(branch)) {
            if (branch.length === 0) return "N/A"
            return branch.map(b => b?.branch_name || b).filter(Boolean).join(", ")
        }
        
        // Handle single branch object
        if (typeof branch === 'object' && branch.branch_name) {
            return branch.branch_name
        }
        
        // Handle string
        if (typeof branch === 'string') {
            return branch
        }
        
        return "N/A"
    }

    return (
        <div
            className="rounded-2xl relative hover:scale-[1.02] transition-all duration-300 overflow-visible shadow-sm border cursor-pointer border-neutral-300 bg-white"
        >
            <div className="absolute left-2 top-2 z-30">
                <span className={`px-3 py-1 leading-5 flex justify-center items-center rounded-full text-white font-medium text-xs ${getStatusColor(item.status)}`}>
                    {capitalizeStatus(item.status)}
                </span>
            </div>
            {
                auth.user.userType === "Admin" &&
                <div className="absolute right-2 top-2 z-30" ref={dropdownRef}>
                        <div className="relative p-1 hover:bg-black/80 transition-all duration-300 bg-black/40 backdrop-blur-sm rounded-md">
                            <EllipsisVertical
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDropdown(!showDropdown)
                                }} size={18} className="text-white cursor-pointer">
                            </EllipsisVertical>
                        </div>
                        {showDropdown && (
                            <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 w-48 z-40" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit()
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                                >
                                    <UserPen size={18} className="text-gray-500"></UserPen>
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleChangeScannerStatus()
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                                >
                                    {item.status === 'active' ? (
                                        <>
                                            <Minus size={18} className="text-gray-500"></Minus>
                                            <span>Deactivate</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} className="text-gray-500"></Check>
                                            <span>Activate</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete()
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 text-red-500"
                                >
                                    <Trash2 size={18}></Trash2>
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                }
            <div className="overflow-hidden rounded-t-2xl">
                {item.sc_image ? (
                    <img className="h-48 object-cover w-full" src={item.sc_image} alt="Scanner"></img>
                ) : (
                    <div className="bg-gradient-to-br from-[#5f9df9] to-[#636ef2] w-full h-48 flex justify-center items-center rounded-t-2xl">
                        <Image size={40} className="text-white"></Image>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white flex flex-col gap-2 rounded-b-2xl">
                <div className="flex items-center gap-2">
                    <User></User>
                    {item.bankaccount?.account_holdername}
                </div>
                <div className="flex items-center gap-2">
                    <Building2 className="text-gray-500"></Building2>
                    <span className="text-gray-500 text-sm">{getBranchesDisplay(item?.branch)}</span>
                </div>
            </div>
            {openConfirmBox && createPortal(
                <ConfirmationBox
                    openForm={openConfirmBox}
                    onClose={handleCloseConfirmationBox}
                    loader={loading}
                    onConfirm={handleConfirmDelete}
                    confirmButton={'Delete'}
                    confirmText={'Are you sure you want to delete this scanner?'}
                />,
                document.body
            )}
        </div>
    )
}

export default ScannnerCard