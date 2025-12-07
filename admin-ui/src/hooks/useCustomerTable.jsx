import { useEffect, useMemo, useState, } from "react";
import Tooltip from '@mui/material/Tooltip';
import { GridActionsCellItem } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { sliceString } from "../helper";

import { changeCustomerStatus, getAllCustomer } from "../services/customerService";
//Importing images
import ADMIN from '../assets/admin.png'
import BOY from '../assets/boy.png'
import BRANCH from '../assets/branch.png'
import PHONE from '../assets/call.png'
import CALENDAR from '../assets/calendar.png'
import BorderColorIcon from '@mui/icons-material/BorderColor';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { formatDate } from "../helper";
import { capitalise } from "../helper";

//Importing icons
import { UserPen, BadgeIndianRupee, Bed } from 'lucide-react';
import { Minus } from 'lucide-react';
import { Check ,ShieldCheck} from 'lucide-react';


export const useCustomerTable = (handleOpenForm, room, handleOpenVerifyCustomer, handleOpenDepositeForm, handleOpenChangeRoom) =>{
    const [rows,setRows] = useState([])
    const [loading , setLoading] = useState(false)

    const handleGetAllCustomers = async (searchQuery="", branch="", room="") =>{
       try{
         setLoading(true)
         const data = await getAllCustomer(searchQuery, branch, room)
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
      handleGetAllCustomers("","",room)
    },[])

    const handleChangeCustomerStatus = async (customerId, status) =>{
      setLoading(true)
      try{
        const data = await changeCustomerStatus(customerId, status)
        await handleGetAllCustomers()
        toast.success("Customer status changed successfully.")
      }catch(err){
        console.log(err)
        toast.error(err?.message || "Something went wrong.")
      }finally{
        setLoading(false)
      }
    }

    const renderAction = (data) =>{

      let actionArr = []

       if(data.row.status === 'pending'){
         actionArr.push(
            <GridActionsCellItem
            label="Verify Account"
            onClick={()=>handleOpenVerifyCustomer(data.row)}
            icon={<ShieldCheck size={22}></ShieldCheck>}
            showInMenu
            ></GridActionsCellItem>,
            <GridActionsCellItem
            label="Change Room"
            onClick={()=>handleOpenChangeRoom(data.row)}
            icon={<Bed size={22}></Bed>}
            showInMenu
            ></GridActionsCellItem>
         )
       }else{
          actionArr.push(
           <GridActionsCellItem
           icon={<UserPen size={22}></UserPen>}
           label="Edit"
           onClick={()=>handleOpenForm(data.row)}
           showInMenu
           ></GridActionsCellItem>,
           <GridActionsCellItem
           icon={data.row.status === 'active'?<Minus size={22}></Minus>:<Check size={22}></Check>}
           label={data.row.status === 'active' ? "Deactivate" : "Activate"}
           onClick={()=>handleChangeCustomerStatus(data.row._id, data.row.status==="active" ? "inactive" : "active")}
           showInMenu
           ></GridActionsCellItem>, 
         )
         if(data.row.deposite_status === 'Pending'){
            actionArr.push(
              <GridActionsCellItem
               onClick={()=>handleOpenDepositeForm(data.row)}
               icon={<BadgeIndianRupee size={22}></BadgeIndianRupee>}
               label="Collect Deposite"
               showInMenu
              ></GridActionsCellItem>
            )
         }
       }

       return actionArr

     }
  
    const columns = useMemo(()=>[
        {
            headerName: 'Full Name',
            field: 'customer_name',
            minWidth: 220,
            renderCell: (params) => (
              <div className="flex items-center w-full h-full">
                 <div className="flex items-center gap-3">
                   <img src={params.row.customer_profile_picture ? params.row.customer_profile_picture : BOY} alt="customer" className="w-9 h-9 rounded-full" />
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
            headerName:'Status',
            field: 'status',
            minWidth: 140,
            flex: 1,
            renderCell: (params) => {
              const isActive = params.value;
              return (
                <div className="flex items-center w-full h-full">
                  <span className={`px-3 py-1 leading-5 flex justify-center items-center rounded-full w-20 text-white font-medium ${isActive==="active" ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {capitalise(params.value)}
                  </span>
                </div>
              );
            },
          },
          {
            headerName:'Deposite Status',
            field: 'deposite_status',
            minWidth: 160,
            flex: 1,
            renderCell: (params) => {
              const status = params.value;
              return (
                <div className="flex items-center w-full h-full">
                  {
                    (params.row.deposite_amount === null || params.row.deposite_amount === undefined) ? (
                      <span className="px-3 py-1 leading-5 flex gap-1 justify-center items-center rounded-full w-24  font-medium bg-gray-200 text-gray-500">
                        Not Verified
                      </span>
                    ) : (
                      <span className={`px-3 py-1 leading-5 flex gap-1 justify-center items-center rounded-full w-24  font-medium ${status==="Paid" ? 'bg-green-500 text-white' : 'bg-yellow-100 border border-yellow-500 text-yellow-500'}`}>
                        {status === "Paid" ?
                         "Paid" :
                          `₹${params.row.deposite_amount - params.row.paid_deposite_amount}`
                        }
                        {status === 'Pending' && <small className="text-[10px] text-yellow-500 text-white">Pending</small>}
                      </span>
                    )
                  }
                </div>
              );
            },
          },
          {
            headerName: 'Joining Date',
            field: 'joining_date',
            minWidth: 150,
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
          {
            headerName: 'Actions',
            field: 'actions',
            type:'actions',
            minWidth: 150,
            getActions: (params) => renderAction(params)
        }
               
    ],[handleOpenForm])

    return {rows, columns, loading, refetch : handleGetAllCustomers}
}