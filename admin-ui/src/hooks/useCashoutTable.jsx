import { useEffect, useState, } from "react";
import Tooltip from '@mui/material/Tooltip';
import { toast } from "react-toastify";
import { sliceString, formatDate } from "../helper";

//Importing images
import BOY from '../assets/boy.png'
import BANK from '../assets/bank.png'
import CALENDAR from '../assets/calendar.png'

import { capitalise } from "../helper";
import { getAllCashout } from "../services/cashoutService";

export const useCashoutTable = () =>{
    const [rows, setRows] = useState([])
    const [loading,setLoading] = useState(false)

    const handleGetAllCashout = async (searchQuery="", branch="") => {
        try{
            setLoading(true)
            const data = await getAllCashout(searchQuery, branch)
            console.log(data)
            setRows(data)
        }catch(err){
            console.log(err)
            toast.error(err?.message)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
       handleGetAllCashout()
    },[])

    const columns = [
        {
            headerName: 'Person Name',
            field: 'person_name',
            minWidth: 220,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                 <div className="flex items-center gap-3">
                   <img src={BOY} alt="vendor" className="w-9 h-9 rounded-full" />
                   <div className="flex flex-col">
                     <span className="leading-5">{capitalise(params.row.refId.person_name)}</span>
                     <div className="flex text-gray-600 items-center gap-0.5">
                        <span className="text-sm">+91</span>
                        <span className="text-sm tracking-wide">{params.row.refId.mobile_no}</span>
                     </div>
                   </div>
                 </div>
              </div>
            ),
        },
        {
            headerName: 'Amount',
            field: 'amount',
            minWidth: 150,
            flex: 1,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-2">
                 <span className={`${params.row.transactionType === "expense" ? "text-red-500" : "text-green-500"}`}>{params.row.transactionType === "expense" ? "-" : "+"} ₹{params.row.refId.amount}</span>
                </div>
              </div>
            ),
        },
        {
            headerName: 'Bank Account',
            field: 'account_holdername',
            minWidth:240,
            renderCell: (params) => (
                <div className="flex items-center w-full h-full">
                    <div className="flex items-center gap-2">
                        <img src={BANK} alt="bank" className="w-7 h-7" />
                        <span>{params.row.bank_account.account_holdername}</span>
                    </div>
                </div>
            )
        },
        {
            headerName: 'Notes',
            field: "refId.notes",
            minWidth: 200,
            renderCell: (params) => (
                <div className="flex w-full h-full items-center">
                    <div className="flex items-center gap-2">
                        <Tooltip title={params.value}>
                           <span>{sliceString(params.value, 20)}</span>
                        </Tooltip>
                    </div>
                </div>
            )
        },
        {
            headerName: 'Created At',
            field:'createdAt',
            minWidth: 200,
            flex: 1,
            renderCell: (params) => (
                <div className="flex items-center w-full h-full">
                  <div className="flex items-center gap-2">
                    <img src={CALENDAR} alt="calendar" className="w-7 h-7" />
                    <span className="font-medium">{formatDate(params.value)}</span>
                  </div>
                </div>
            ),
        },
    ]

    return {columns, rows, loading, refetch:handleGetAllCashout}
}