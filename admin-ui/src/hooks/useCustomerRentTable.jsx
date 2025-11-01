import { useEffect, useState, } from "react";
import Tooltip from '@mui/material/Tooltip';
import { toast } from "react-toastify";
import { getShortMonthName, sliceString } from "../helper";
import { GridActionsCellItem } from "@mui/x-data-grid";

//Importing images
import BOY from '../assets/boy.png'
import BRANCH from '../assets/branch.png'
import PHONE from '../assets/call.png'
import { HandCoins } from 'lucide-react';


import { capitalise } from "../helper";

//Importing icons
import { getCustomerPendingRents } from "../services/customerService";



export const useCustomerRentTable = (handleRedirectToRentPreview) =>{
    const [rows, setRows] = useState([])
    const [loading,setLoading] = useState(false)

    const handleGetAllCustomerRent = async (searchQuery="", branch="") =>{
        try{
           setLoading(true)
           const data = await getCustomerPendingRents(searchQuery, branch)
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
       handleGetAllCustomerRent()
    },[])


    const columns = [
        {
            headerName: 'Full Name',
            field: 'customer_name',
            minWidth: 220,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                 <div className="flex items-center gap-3">
                   <img src={BOY} alt="vendor" className="w-9 h-9 rounded-full" />
                   <div className="flex flex-col">
                     <span className="leading-5 font-medium">{capitalise(params.value)}</span>
                     <div className="flex text-gray-600 items-center gap-0.5">
                       <span className="text-sm">+91</span>
                       <span className="text-sm tracking-wide">{params.row.mobile_no}</span>
                      </div>
                   </div>
                 </div>
              </div>
            ),
        },
        {
            headerName: 'Room No',
            field: 'room',
            minWidth: 100,
            flex: 1,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{params.value.room_id}</span>
                 </div>
              </div>
            ),
        },
        {
            headerName: 'Branch',
            field: 'branch',
            minWidth: 160,
            flex: 1,
            renderCell: (params) => (
             <div className="flex items-center w-full h-full">
                <Tooltip title={params.value.branch_name}>
                 <div className="flex items-center gap-2">
                   <img src={BRANCH} alt="branch" className="w-7 h-7 rounded-full" />
                   <span>{sliceString(params.value.branch_name,20)}</span>
                 </div>
                </Tooltip>
             </div>
            ),
        },
          {
            headerName: 'Rent Amount',
            field: 'rent_amount',
            minWidth: 140,
            flex: 1,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-2">
                 <span className="font-semibold">₹{params.value}</span>
                </div>
              </div>
            ),
          },
          {
            headerName: 'Pending Amount',
            field: 'pending_amount',
            minWidth:160,
            flex: 1,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-2">
                 <span className="font-semibold">₹{params.value}</span>
                </div>
              </div>
            )
          },
          {
            headerName: 'Months',
            field: 'pending_rent',
            minWidth: 160,
            renderCell: (params) =>(
                <div className="flex w-full h-full items-center">
                    <div className="flex items-center gap-2">
                        {
                            params.value.map((item,index)=> (
                                <div key={index} className={`flex p-1 border rounded-md ${item.required ? "bg-red-100" : "bg-neutral-50" } items-center gap-2`}>
                                  <span className="leading-5">{getShortMonthName(item.month)}</span>
                                  <span className="leading-5">{item.year}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )
          },
          {
            headerName: 'Action',
            field: 'actions',
            type:'actions',
            minWidth: 120,
            flex: 1,
            getActions: (params) => [
            <GridActionsCellItem 
            icon={<HandCoins></HandCoins>}
            label="Pay Rent"
            onClick={()=> handleRedirectToRentPreview(params.row)}
            ></GridActionsCellItem>]
          }
    ]

    return {columns, rows, loading, refetch: handleGetAllCustomerRent}
}