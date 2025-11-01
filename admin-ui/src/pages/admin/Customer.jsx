import React, { useState, useEffect } from 'react'
import CustomerForm from '../../components/CustomerForm';
import VerifyCustomer from '../../components/VerifyCustomer';
import DepositeForm from '../../components/DepositeForm';

import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

import { useCustomerTable } from '../../hooks/useCustomerTable';
import Breadcrumb from '../../components/Breadcrumb';

function Customer() {
  const [openForm,setOpenForm] = useState(false)
  const [selectedCustomer,setSelectedCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch,setSelectedBranch] = useState('')
  const [openVerifyCustomer,setOpenVerifyCustomer] = useState(false)
  const [openDepositeForm,setOpenDepositeForm] = useState(false)
  
  const handleOpenForm = (customer=null) =>{
    setSelectedCustomer(customer)
    setOpenForm(true)
  }

  const handleOpenVerifyCustomer = (data) =>{
    setSelectedCustomer(data)
    setOpenVerifyCustomer(true)
  }

  const handleOpenDepositeForm = (data) => {
    setSelectedCustomer(data)
    setOpenDepositeForm(true)
  }
 
  const { loading, rows, columns, refetch} = useCustomerTable(handleOpenForm, "", handleOpenVerifyCustomer, handleOpenDepositeForm)

  const handleCloseForm = (refresh) =>{
    setSelectedCustomer(null)
    setOpenForm(false)
    if(refresh) refetch()
  }

  const handleCloseVerifyCustomer = (refresh = false) =>{
    setSelectedCustomer(null)
    setOpenVerifyCustomer(false)
    if(refresh) refetch()
  }

  const handleCloseDepositeForm = (refresh = false) =>{
    setSelectedCustomer(null)
    setOpenDepositeForm(false)
    if(refresh) refetch()
  }

  useEffect(()=>{
    refetch(searchQuery, selectedBranch)
  },[searchQuery, selectedBranch])


  return (
    <div className='flex w-full h-full flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0'>
      <Breadcrumb selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onClick={()=>handleOpenForm(null)}></Breadcrumb>
      {openForm && <CustomerForm selectedCustomer={selectedCustomer} onClose={handleCloseForm}></CustomerForm>}
      <VerifyCustomer customer={selectedCustomer} onClose={handleCloseVerifyCustomer} openForm={openVerifyCustomer} ></VerifyCustomer>
      <DepositeForm openForm={openDepositeForm} customer={selectedCustomer} onClose={handleCloseDepositeForm}></DepositeForm>
      <div className='h-full ag-theme-alpine w-full min-h-[400px] sm:min-h-[500px] customer-grid'>
      <Box 
            sx={{
             height: "100%",
             "& .MuiDataGrid-root": {
            border: "none", 
            borderRadius: "12px",
            overflow: "hidden",
            },
            "& .MuiDataGrid-columnHeaders": {
               backgroundColor: "#edf3fd",  // Header background color
               fontWeight: "bold",  
               fontSize:'.9rem'
             },    
            }}>
           <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={70}
            loading={loading}
            initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
           }}
           pageSizeOptions={[5,10]}
           disableRowSelectionOnClick
          />
         </Box>
      </div>

    </div>
  )
}

export default Customer