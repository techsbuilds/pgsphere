import { useEffect, useState, } from "react";
import Tooltip from '@mui/material/Tooltip';
import { toast } from "react-toastify";
import { sliceString } from "../helper";

//Importing images
import BRANCH from '../assets/branch.png'
import BANK from '../assets/bank.png'
import CALENDAR from '../assets/calendar.png'

import { formatDate } from "../helper";
import { capitalise } from "../helper";

//Importing icons
import { getAllTransactions } from "../services/transactionService";

export const useTransactionTable = () =>{
    const [rows,setRows] = useState([])
    const [loading, setLoading] = useState(false)

    const handleGetAllTransaction = async (branch="", transactionType="") =>{
        setLoading(true)
        try{
          const data = await getAllTransactions(branch, transactionType)
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
       handleGetAllTransaction()
    },[])

    const getTransactionType = (transactionType) =>{
        switch(transactionType){
          case "rent_attempt":
            return "Rent"
          case "employee_salary":
            return "Salary"
          case "inventory_purchase":
            return "Inventory"
          case "cash_given":
            return "Cashout"
          case "monthly_bill":
            return "Monthly Bill"
          case "deposite":
            return "Deposite"
          case "withdrawal":
            return "withdrawal"
          default:
            return "Transaction"
        }
    }

    const getStatusColor = (status) => {
        switch(status){
          case "completed":
            return "bg-green-500"
          case "pending":
            return "bg-yellow-500"
          case "rejected":
            return "bg-red-500"
          default:
            return "bg-gray-500"
        }
    }

    const columns = [
       {
        headerName: 'Transaction Type',
        field: 'type',
        minWidth: 220,
        renderCell: (params) => (
          <div className="flex items-center w-full h-full">
             <div className="flex items-center gap-3">
               <span>{getTransactionType(params.value)}</span>
             </div>
          </div>
        ),
       },
       {
        headerName: 'Amount',
        field: 'refId',
        minWidth: 200,
        flex: 1,
        renderCell: (params) => (
          <div className="flex items-center w-full h-full">
            <div className="flex items-center gap-2">
             <span className={`${params.row.transactionType === "expense" || params.row.transactionType === "withdrawal" ? "text-red-500" : "text-green-500"}`}>{params.row.transactionType === "expense" || params.row.transactionType === "withdrawal" ? "-" : "+"} ₹{params.row.refId.amount}</span>
            </div>
          </div>
        ),
        },
        {
          headerName: "Status",
          field: 'status',
          minWidth: 140,
          flex: 1,
          renderCell: (params) => (
            <div className="flex items-center w-full h-full">
              <span className={`px-3 py-1 leading-5 flex justify-center items-center rounded-full w-20 text-white font-medium ${getStatusColor(params.value)}`}>{capitalise(params.value)}</span>
            </div>
          )
        },
        {
            headerName: "Payment Mode",
            field: 'payment_mode',
            minWidth:200,
            flex:1,
            renderCell: (params) => (
                <div className="flex items-center w-full h-full">
                    <div className="flex items-center gap-2">
                        <span>{capitalise(params.value)}</span>
                    </div>
                </div>
            )
        },
        {
            headerName: 'Bank Account',
            field: 'bank_account',
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
          headerName: 'Branch',
          field: 'branch',
          minWidth: 260,
          flex: 1,
          renderCell: (params) => (
              params.row.branch ? (
                <div className="flex items-center w-full h-full">
                  <Tooltip title={params.row.branch.branch_name}>
                    <div className="flex items-center gap-2">
                      <img src={BRANCH} alt="branch" className="w-7 h-7 rounded-full" />
                      <span>{sliceString(params.row.branch.branch_name,20)}</span>
                    </div>
                  </Tooltip>
                </div>
              ) : (
                <div className="flex items-center w-full h-full">
                  <span>N/A</span>
                </div>
              )
          ),
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

    return {columns, rows, loading, refetch:handleGetAllTransaction}
}