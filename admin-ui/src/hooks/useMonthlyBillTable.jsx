import { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import { sliceString } from "../helper";
import { GridActionsCellItem } from "@mui/x-data-grid";

//Importing images
import BRANCH from "../assets/branch.png";
import BILL from '../assets/invoice.png'

import { SquarePen } from 'lucide-react';
import { Trash } from 'lucide-react';
import { HandCoins } from 'lucide-react';

import { capitalise } from "../helper";
import { getAllMonthlyBill } from "../services/monthlyBillService";
import { getShortMonthName } from "../helper";

export const useMonthlyBillTable = (handleOpenForm, handleOpenConfirmationBox, handleOpenPayForm) =>{
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(false)

    const handleGetAllMonthlyBills = async (searchQuery="", branch="") =>{
        setLoading(true)
        try{
            const data = await getAllMonthlyBill(searchQuery, branch)
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
       handleGetAllMonthlyBills()
    },[])

    const renderAction = (data) =>{
        let actionArr = [
            <GridActionsCellItem
            icon={<SquarePen size={22}></SquarePen>}
            label="Edit"
            onClick={()=>handleOpenForm(data.row)}
            showInMenu
            ></GridActionsCellItem>,
            <GridActionsCellItem
            icon={<Trash size={22}></Trash>}
            label="Delete"
            onClick={()=>handleOpenConfirmationBox(data.row)}
            showInMenu
            ></GridActionsCellItem>,
        ]
        if(data.row.pendingMonths.length > 0){
            actionArr.push(
                <GridActionsCellItem
                icon={<HandCoins size={22}></HandCoins>}
                label="Pay Bill"
                onClick={()=>handleOpenPayForm(data.row)}
                showInMenu
                ></GridActionsCellItem>
            )
        }
        return actionArr
    }


    const columns = [
        {
            headerName: 'Bill Name',
            field: 'billName',
            minWidth: 220,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                <div className="flex items-center gap-3">
                  <img src={BILL} alt="bill" className="w-7 h-7" />
                  <span>{capitalise(params.value)}</span>
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
            headerName: 'Pending Months',
            field:'pendingMonths',
            minWidth: 250,
            flex: 1,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                 <div className="flex items-center gap-2">
                    {
                     params.value.length > 0 ?
                     params.value.map((item,index) => (
                        <div key={index} className={`flex p-1 border rounded-md ${item.required ? "bg-red-100" : "bg-neutral-50"} items-center gap-2`}>
                            <span className="leading-5">{getShortMonthName(item.month)}</span>
                            <span className="leading-5">{item.year}</span>
                        </div>
                     ))
                     : <span> - </span>
                    }
                 </div>
              </div>
            ),
        },
        {
            headerName: 'Notes',
            field:'notes',
            minWidth: 250,
            flex: 1,
            renderCell: (params) => (
                <div className="flex items-center w-full h-full">
                    <Tooltip title={params.value}> 
                       <p>{sliceString(params.value, 20)}</p>
                    </Tooltip>
                </div>
            )
        },
        {
            headerName: 'Actions',
            field: 'actions',
            type: 'actions',
            minWidth: 150,
            getActions: (params) => renderAction(params)
        }
    ]

    return {rows, loading, columns, refetch: handleGetAllMonthlyBills}
    
}