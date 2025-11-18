import React, { useEffect } from 'react'
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

import { toast } from 'react-toastify';
import SearchItem from './SearchItem';

//Importing icons
import { LoaderCircle, Search } from 'lucide-react';
import EMPTY from '../assets/empty.png'

import { getDashboardSearch } from '../services/adminService';
import { getDashboardSearchbyAcmanager } from '../services/accountService';

function SearchBar({ setOpenSearchBar }) {
  const [activeTab, setActiveTab] = useState('Customers')
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth } = useAuth()

  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenSearchBar(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  })

  const handleGetDashboardSearch = async (role, query) => {
    setLoading(true)
    try {
      let data = []
      if (auth.user.userType === "Account") {
        data = await getDashboardSearchbyAcmanager(role, query)
      } else {
        data = await getDashboardSearch(role, query)
      }
      console.log(data)
      setSearchResults(data)
    } catch (err) {
      console.log(err)
      toast.error(err?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetRole = (role) => {
    setActiveTab(role)
    setSearchResults([])
  }

  useEffect(() => {
    handleGetDashboardSearch(activeTab, searchQuery)
  }, [searchQuery])

  return (
    <div className='fixed z-50 backdrop-blur-sm flex justify-center items-center inset-0 bg-black/40 p-4'>
      <div ref={wrapperRef} className='w-full max-w-md sm:max-w-lg lg:max-w-xl overflow-hidden flex flex-col bg-white rounded-2xl shadow-lg'>
        {/* Search Input */}
        <div className='w-full border-b border-neutral-300 p-3 sm:p-4 flex items-center gap-2'>
          <Search size={16} className='text-gray-500 flex-shrink-0'></Search>
          <input 
            onChange={(e) => setSearchQuery(e.target.value)} 
            autoFocus 
            type='text' 
            className='outline-none h-8 w-full text-sm' 
            placeholder='Search for anything...'
          ></input>
        </div>

        {/* Tab Buttons */}
        <div className='p-3 sm:p-4'>
          <div className='flex items-center'>
            <button 
              onClick={() => handleSetRole("Customers")} 
              className={`px-3 py-2 text-sm sm:text-base ${activeTab === "Customers" && "bg-[#2b7fff] text-white"} border-neutral-300 cursor-pointer border rounded-l-2xl hover:bg-gray-50 transition-colors`}
            >
              <span>Customers</span>
            </button>
            <button 
              onClick={() => handleSetRole("Employees")} 
              className={`px-3 py-2 text-sm sm:text-base ${activeTab === "Employees" && "bg-[#2b7fff] text-white"} cursor-pointer border-t ${auth.user.userType === "Account" && "border-r rounded-r-2xl"} border-neutral-300 border-b hover:bg-gray-50 transition-colors`}
            >
              <span>Employees</span>
            </button>

            {auth.user.userType === "Admin" && (
              <button 
                onClick={() => handleSetRole("Ac Managers")} 
                className={`px-3 py-2 text-sm sm:text-base ${activeTab === "Ac Managers" && "bg-[#2b7fff] text-white"} cursor-pointer border border-neutral-300 rounded-r-2xl hover:bg-gray-50 transition-colors`}
              >
                <span>Ac Managers</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className='h-64 sm:h-96 w-full scroll-smooth overflow-scroll'>
          {
            loading ? (
              <div className='w-full h-full flex justify-center items-center p-4'>
                <LoaderCircle size={28} className='animate-spin text-blue-500'></LoaderCircle>
              </div>
            ) : searchResults.length === 0 ? (
              <div className='w-full h-full flex justify-center items-center p-4'>
                <img src={EMPTY} className='h-24 w-24 sm:h-32 sm:w-32 object-contain'></img>
              </div>
            ) : (
              <div className='flex flex-col gap-2 p-3 sm:p-4'>
                {
                  searchResults.map((item, index) => (
                    <SearchItem key={index} role={activeTab} item={item} ></SearchItem>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default SearchBar