import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//import icon
import { Search } from 'lucide-react';
import { Bell } from 'lucide-react';
import { LogOut, User } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import { Menu, House } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

import SearchBar from './SearchBar';

function Header({setShowSideBar, showSideBar}) {
  const {auth, setAuth} = useAuth()
  const [openSearchBar,setOpenSearchBar] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () =>{
    try{
      const data = await logout()
      setAuth({
        loading:false,
        token:null,
        user:null
      })
      navigate('/login')
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }
  }

  const handleNavigateProfile = () =>{
    console.log('navigate to profile')
    navigate('profile')
 }

  return (
    <>
    {openSearchBar && <SearchBar setOpenSearchBar={setOpenSearchBar}></SearchBar>}
    <div className={`h-16 p-2 flex justify-between items-center px-4 md:px-8 fixed top-0 right-0 left-0 ${showSideBar ? 'md:left-64' : 'md:left-0'} bg-white z-10 border-b border-neutral-200 transition-all duration-300 ease-in-out`}>
       <div className='flex items-center gap-4'>
         {!showSideBar && <Menu className='cursor-pointer hover:bg-gray-100 p-1 rounded-md' onClick={()=>setShowSideBar((prev)=> !prev)}></Menu>}
         {/* Show logo and app name when sidebar is closed */}
         {!showSideBar && (
           <div className='flex items-center gap-2 animate-in fade-in duration-300'>
             <div className='bg-blue-500 rounded-md flex justify-center items-center p-2'>
               <House size={18} className='text-white'></House>
             </div>
             <h1 className='text-xl font-semibold'>Pgsphere</h1>
           </div>
         )}
       </div>
       <div className='flex items-center gap-2 sm:gap-4'>
         <div className='bg-[#F9FAFB] border w-32 sm:w-40 md:w-52 lg:w-96 border-neutral-200 px-2 rounded-md flex items-center gap-1 sm:gap-2'>
           <Search size={16} className='text-gray-500 flex-shrink-0'></Search>
           <input onFocus={()=>setOpenSearchBar(true)} type='text' className='outline-none h-7 text-xs sm:text-sm flex-1' placeholder='Search...'></input>
         </div>
         {/* <Bell size={16} className='text-gray-500'></Bell> */}
         {
          auth.user.userType === 'Admin' &&
          <Tooltip onClick={handleNavigateProfile} title="profile">
          <User size={20} className='text-gray-500 cursor-pointer'></User>
         </Tooltip>
         }
         {/* <Tooltip title="notifications">
         <Bell size={20} className='text-gray-500 cursor-pointer'></Bell>
         </Tooltip> */}
         <Tooltip title="logout">
         <LogOut onClick={handleLogout} className='cursor-pointer text-red-500' size={20}></LogOut>
         </Tooltip>
       </div>
    </div>
    </>
  )
}

export default Header