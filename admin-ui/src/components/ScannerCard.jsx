
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "../context/AuthContext"
import { Image, User, EllipsisVertical, Trash2, Minus, Check, UserPen } from "lucide-react"
import { updateStatusScanner, deleteScanner } from "../services/scannerServices"
import { toast } from "react-toastify"
import ConfirmationBox from "./ConfirmationBox"

function ScannnerCard({ openForm, item }) {

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
            // Refresh the page or reload data - parent component should handle this
            window.location.reload()
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
            window.location.reload()
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
    return (
        <div
            className="rounded-2xl relative hover:scale-[1.02] transition-all duration-300 overflow-visible shadow-sm border cursor-pointer border-neutral-300"
        >
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
            <div className="overflow-hidden">
                {item.sc_image ? (
                    <img className="h-48 object-cover w-full" src={item.sc_image}></img>
                ) : (
                    <div className="bg-gradient-to-br from-[#5f9df9] to-[#636ef2] w-full h-48 flex justify-center items-center">
                        <Image size={40} className="text-white"></Image>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <User></User>
                    {item.bankaccount?.account_holdername}
                </div>
                <span className="text-gray-500 text-sm">{item?.branch?.branch_name}</span>
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