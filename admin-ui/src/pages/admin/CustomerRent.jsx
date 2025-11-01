import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

import Breadcrumb from "../../components/Breadcrumb";
import { useCustomerRentTable } from "../../hooks/useCustomerRentTable";

function CustomerRent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const handleRedirectToRentPreview = (customer) => {
    navigate('/admin/rent-preview', {state: {customerId:customer.customerId}})
  }

  const { loading, rows, columns, refetch } =
    useCustomerRentTable(handleRedirectToRentPreview);


  useEffect(()=>{
    refetch(searchQuery, selectedBranch) 
  },[searchQuery, selectedBranch])  

  return (
    <div className="flex w-full h-full flex-col gap-8">
      <Breadcrumb
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      ></Breadcrumb>

      <div className="h-full ag-theme-alpine w-full">
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
            getRowId={(row)=>row.customerId}
            rows={rows}
            columns={columns}
            rowHeight={70}
            onRowClick={(params)=>handleRedirectToRentPreview(params.row)}
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
  );
}

export default CustomerRent;
