import React, {useEffect, useState} from 'react'
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// ✅ AG Grid CSS (core and theme)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Or any other theme

import Breadcrumb from '../../components/Breadcrumb';
import { useCashoutTable } from '../../hooks/useCashoutTable';
import CashoutForm from '../../components/CashoutForm';

ModuleRegistry.registerModules([AllCommunityModule]);

function CashOut() {
  const [openForm, setOpenForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  console.log(searchQuery)

  const {rows , columns , loading , refetch } = useCashoutTable()

  useEffect(()=>{
     refetch(searchQuery)
  },[searchQuery])

  const handleOpenForm = () =>{
    setOpenForm(true)
  }

  const handleCloseForm = (refresh = false) =>{
   setOpenForm(false)
   if(refresh) refetch()
  }


  return (
    <div className='flex w-full h-full flex-col gap-8'>
      {openForm && <CashoutForm onClose={handleCloseForm}></CashoutForm>}
      <Breadcrumb
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onClick={handleOpenForm}
      ></Breadcrumb>

     <div className='h-full ag-theme-alpine w-full'>
        <AgGridReact
          rowData={rows}
          rowHeight={70}
          loading={loading}
          headerHeight={54}
          columnDefs={columns}
          modules={[AllCommunityModule]}
          pagination={true}
          paginationPageSize={10}
          defaultColDef={{
            resizable: true,
            sortable: true,
            // filter: true,
          }}
        />
     </div>

    </div>
  )
}

export default CashOut