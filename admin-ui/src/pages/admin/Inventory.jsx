import React, { useEffect, useState } from "react";

import InventoryForm from "../../components/InventoryForm";

import Breadcrumb from "../../components/Breadcrumb";
import { useInventoryTable } from "../../hooks/useInventoryTable";

//Importing icons
import { Package } from "lucide-react";

function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch,setSelectedBranch] = useState('')
  const [openForm,setOpenForm] = useState(false)

  const {rows, columns, loading, refetch} = useInventoryTable()

  const handleOpenForm = () =>{
    setOpenForm(true)
  }

  useEffect(()=>{
    refetch(searchQuery, selectedBranch)
  },[searchQuery, selectedBranch])

  const handleCloseForm = (refresh = false) =>{
    setOpenForm(false)
    if(refresh) refetch()
  }

  return (
    <div className="flex w-full h-full flex-col gap-8">
      {openForm && <InventoryForm onClose={handleCloseForm}></InventoryForm>}
      <Breadcrumb
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedBranch={selectedBranch}
      setSelectedBranch={setSelectedBranch}
      onClick={handleOpenForm}
      ></Breadcrumb>

      <div className="h-full w-full flex justify-center items-center">
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <div className="bg-gradient-to-br from-[#5f9df9] to-[#636ef2] p-6 rounded-full">
            <Package size={48} className="text-white"></Package>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl text-center sm:text-3xl font-semibold text-gray-800">This Feature is Coming Soon</h1>
            <p className="text-gray-500 text-center text-sm sm:text-base max-w-md">
              We're working hard to bring you an amazing inventory management experience. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory