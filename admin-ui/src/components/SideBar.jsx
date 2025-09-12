import React from 'react'
import { Link, useLocation } from 'react-router-dom';

//Importing icon
import { House, User, X } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { Users } from 'lucide-react';
import { IdCardLanyard } from 'lucide-react';
import { ShieldUser } from 'lucide-react';
import { Coins } from 'lucide-react';
import { Wallet } from 'lucide-react';
import { Box } from 'lucide-react';
import { BookText } from 'lucide-react';
import { HandCoins } from 'lucide-react';
import { ArrowLeftRight } from 'lucide-react';


const adminRoutes = [
    {
      label:'Dashboard',
      icon:LayoutDashboard,
      link:'/admin'
    },
    {
      label:'Branches',
      icon:Building2,
      link:'/admin/branches'
    },
    {
      label:'Customers',
      icon:Users,
      link:'/admin/customers'
    },
    {
      label:'Employees',
      icon:IdCardLanyard,
      link:'/admin/employees'
    },
    {
      label:'Account Managers',
      icon:ShieldUser,
      link:'/admin/accountmanagers'
    },
    {
      label:'Rents',
      icon:Coins,
      link:'/admin/rents'
    },
    {
      label:'Salary',
      icon:Wallet,
      link:'/admin/salary'
    },
    {
      label:'Inventory',
      icon:Box,
      link:'/admin/inventory'
    },
    {
      label:'Monthly Bills',
      icon:BookText,
      link:'/admin/monthlybill'
    },
    {
      label:'Cashout',
      icon:HandCoins,
      link:'/admin/cashout'
    },
    {
      label:'Transactions',
      icon:ArrowLeftRight,
      link:'/admin/transactions'
    }
]

function SideBar({showSideBar, setShowSideBar}) {
  const location = useLocation()

  const isActive = (label) =>{
     if((location.pathname==='/admin' || location.pathname==='/account') && label==='Dashboard') return true
     if(location.pathname.includes(label.toLowerCase())) return true
     if(location.pathname.includes("accountmanagers") && label === "Account Managers") return true
     if(location.pathname.includes('monthlybill') && label === "Monthly Bills") return true

     return false

  }

  return (
    <div className={`w-64 bg-white border-r border-neutral-200 fixed top-0 ${showSideBar ? "left-0" : "-left-64"} bottom-0 z-20 transition-transform duration-300 ease-in-out`}>
       {/* Logo */}
       <div className='h-16 w-full flex justify-between items-center px-4'>
         <div className='flex gap-2 items-center'>
           <div className='bg-blue-500 rounded-md flex justify-center items-center p-2'>
              <House size={18} className='text-white'></House>
           </div>
           <h1 className='text-xl font-semibold'>PgPanel</h1>
         </div>
         <button 
           onClick={() => setShowSideBar(false)}
           className='p-1 hover:bg-gray-100 rounded-md'
         >
           <X size={20} className='text-gray-500'></X>
         </button>
       </div>
       {/* Links */}
       <div className='flex flex-col p-6 gap-4'>
          {
            adminRoutes.map(({link, label, icon:Icon}, index) => (
              <Link key={index} to={link} className={`group flex p-2 items-center hover:bg-blue-100 gap-2 ${isActive(label) && "bg-blue-100"} rounded-md`}>
                <Icon className={`${isActive(label) && "text-blue-500"} group-hover:text-blue-500`} size={20}></Icon>
                <span className={`${isActive(label) ? "text-blue-500" : 'text-black'} group-hover:text-blue-500 font-medium`}>{label}</span>
              </Link>
            ))
          }
       </div>
    </div>
  )
}

export default SideBar