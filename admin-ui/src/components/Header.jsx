import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//import icon
import { Search } from 'lucide-react';
import { Bell } from 'lucide-react';
import { LogOut, User } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';
import { Menu, House } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { toast } from 'react-toastify';
import logo1 from '../assets/logo1.png';

import SearchBar from './SearchBar';

function Header({setShowSideBar, showSideBar}) {
  const {auth, setAuth} = useAuth()
  const [openSearchBar,setOpenSearchBar] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const navigate = useNavigate()
  const profileDropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
       
       {/* Mobile Layout */}
       <div className='md:hidden flex items-center justify-between w-full'>
         {/* Left: Hamburger + Logo and Name */}
         <div className='flex items-center gap-2'>
           <Menu size={28} className='cursor-pointer hover:bg-gray-100 p-1 rounded-md' onClick={()=>setShowSideBar((prev)=> !prev)}></Menu>
           <div className='flex items-center gap-2'>
             <img src={logo1} alt="Pgsphere Logo" className='h-12 w-12 object-contain' />
             <h1 className='text-lg font-semibold'>Pgsphere</h1>
           </div>
         </div>
         
         {/* Right: Search Icon and Profile/Logout */}
         <div className='flex items-center gap-3'>
           <Search size={20} className='text-gray-500 cursor-pointer' onClick={()=>setOpenSearchBar(true)}></Search>
           {auth.user.userType === 'Admin' ? (
             <div className='relative' ref={profileDropdownRef}>
               <User size={20} className='text-gray-500 cursor-pointer' onClick={()=>setShowProfileDropdown(!showProfileDropdown)}></User>
               {showProfileDropdown && (
                 <div className='absolute right-0 top-8 bg-white border border-neutral-200 rounded-md shadow-lg py-2 w-32 z-20'>
                   <button onClick={() => {handleNavigateProfile(); setShowProfileDropdown(false)}} className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2'>
                     <User size={16} className='text-gray-500'></User>
                     Profile
                   </button>
                   <button onClick={() => {handleLogout(); setShowProfileDropdown(false)}} className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-500'>
                     <LogOut size={16}></LogOut>
                     Logout
                   </button>
                 </div>
               )}
             </div>
           ) : (
             <LogOut onClick={handleLogout} className='cursor-pointer text-red-500' size={20}></LogOut>
           )}
         </div>
       </div>

       {/* Desktop Layout */}
       <div className='hidden md:flex items-center justify-between w-full'>
         <div className='flex items-center gap-4'>
           {!showSideBar && <Menu className='cursor-pointer hover:bg-gray-100 p-1 rounded-md' onClick={()=>setShowSideBar((prev)=> !prev)}></Menu>}
           {/* Show logo and app name when sidebar is closed */}
           {!showSideBar && (
             <div className='flex items-center gap-2 animate-in fade-in duration-300'>
               <img src={logo1} alt="Pgsphere Logo" className='h-8 w-8 object-contain' />
               <h1 className='text-xl font-semibold'>Pgsphere</h1>
             </div>
           )}
         </div>
         <div className='flex items-center gap-2 sm:gap-4'>
           <div className='bg-[#F9FAFB] border w-32 sm:w-40 md:w-52 lg:w-96 border-neutral-200 px-2 rounded-md flex items-center gap-1 sm:gap-2'>
             <Search size={16} className='text-gray-500 flex-shrink-0'></Search>
             <input onFocus={()=>setOpenSearchBar(true)} type='text' className='outline-none h-7 text-xs sm:text-sm flex-1' placeholder='Search...'></input>
           </div>
           {
            auth.user.userType === 'Admin' &&
            <Tooltip onClick={handleNavigateProfile} title="profile">
            <User size={20} className='text-gray-500 cursor-pointer'></User>
           </Tooltip>
           }
           <Tooltip title="logout">
           <LogOut onClick={handleLogout} className='cursor-pointer text-red-500' size={20}></LogOut>
           </Tooltip>
         </div>
       </div>
    </div>
    </>
  )
}

export default Header