import React, { useEffect, useState } from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { getAllScanner } from '../../services/scannerServices'
import ScannnerCard from '../../components/ScannerCard'
import ScannerForm from '../../components/ScannerForm'

function Scanner() {
  const [scanner, setScanner] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedScanner, setSelectedScanner] = useState(null)

  const handleGetAllScanner = async () => {

    setLoading(true)
    try {
      const data = await getAllScanner(searchQuery)
      setScanner(data)
    } catch (error) {
      toast.error(error?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (scanner = null) => {
    console.log(scanner)
    setSelectedScanner(scanner)
    setOpenForm(true)
  }

  const handleCloseForm = (refresh = false) => {
    setSelectedScanner(null)
    setOpenForm(false)
    if (refresh) handleGetAllScanner()
  }

  useEffect(() => {
    handleGetAllScanner()
  }, [searchQuery])

  return (
    <div className='flex flex-col h-full gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0'>
      {openForm && <ScannerForm selectedScanner={selectedScanner} onClose={handleCloseForm}></ScannerForm>}
      <Breadcrumb searchQuery={searchQuery} setSearchQuery={setSearchQuery} onClick={handleOpenForm}></Breadcrumb>
      {
        loading ?
          <div className='flex h-full w-full justify-center items-center py-8 sm:py-12'>
            <LoaderCircle size={24} className='sm:w-8 md:h-8 text-blue-500 animate-spin'></LoaderCircle>
          </div>
          : scanner.length === 0 ?
            <div className='flex h-full w-full justify-center items-center py-8 sm:py-12'>
              <div className='flex flex-col items-center gap-2 sm:gap-3'>
                <p className='text-gray-500 text-sm sm:text-base'>No Scanner Found</p>
              </div>
            </div>
            :
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 items-stretch gap-4 sm:gap-6 lg:gap-8'>
              {
                scanner.map((item, index) => (
                  <ScannnerCard openForm={handleOpenForm} key={index} item={item} handleGetAllScanner={handleGetAllScanner}></ScannnerCard>
                ))
              }
            </div>
      }
    </div>
  )
}

export default Scanner