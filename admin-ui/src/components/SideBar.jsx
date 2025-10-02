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

//Importing images
import LOGO from '../assets/logo1.png'


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

let accountRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    link: "/account",
  },
  {
    label: "Branches",
    icon: Building2,
    link: "/account/branches",
  },
  {
    label: "Customers",
    icon: Users,
    link: "/account/customers",
  },
  {
    label: "Employees",
    icon: IdCardLanyard,
    link: "/account/employees",
  },
  {
    label: "Rents",
    icon: Coins,
    link: "/account/rents",
  },
  {
    label: "Salary",
    icon: Wallet,
    link: "/account/salary",
  },
  {
    label: "Inventory",
    icon: Box,
    link: "/account/inventory",
  },
  {
    label: "Monthly Bills",
    icon: BookText,
    link: "/account/monthlybill",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    link: "/account/transactions",
  },
];

function SideBar({showSideBar, setShowSideBar, type}) {
  const location = useLocation()

  const isActive = (label) =>{
     if((location.pathname==='/admin' || location.pathname==='/account') && label==='Dashboard') return true
     if(location.pathname.includes(label.toLowerCase())) return true
     if(location.pathname.includes("accountmanagers") && label === "Account Managers") return true
     if(location.pathname.includes('monthlybill') && label === "Monthly Bills") return true

     return false

  }

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 768) {
      setShowSideBar(false)
    }
  }

  let routes = type === 'account' ? accountRoutes : adminRoutes

  return (
    <div className={`w-64 bg-[#202947] border-r border-neutral-200 fixed top-0 ${showSideBar ? "left-0" : "-left-64"} bottom-0 z-20 transition-transform duration-300 ease-in-out`}>
       {/* Logo */}
       <div className='h-16 relative w-full flex border-b border-[#383e59] justify-start items-center p-4'>
         <div className='flex items-center gap-4'>
           <div className='flex rounded-2xl bg-white justify-center items-center'>
             <img className='w-12 h-12' src={LOGO}></img>
           </div>
           <h1 className='text-white text-xl font-semibold'>Pgsphere</h1>
         </div>
         <button 
           onClick={() => setShowSideBar(false)}
           className='p-1 right-1 absolute hover:bg-gray-100 rounded-md'
         >
           <X size={20} className='text-gray-500'></X>
         </button>
       </div>
       {/* Links */}
       <div className='flex flex-col p-6 gap-4'>
          {
            routes.map(({link, label, icon:Icon}, index) => (
              <Link 
                key={index} 
                to={link} 
                onClick={handleLinkClick}
                className={`group flex p-2 px-4 items-center hover:bg-white gap-2 ${isActive(label) && "bg-white"} rounded-full`}
              >
                <Icon className={`${isActive(label) ? "text-[#202947]" : 'text-[#a2a6ba]'} group-hover:text-[#202947]`} size={20}></Icon>
                <span className={`${isActive(label) ? "text-[#202947]" : 'text-[#a2a6ba]'} group-hover:text-[#202947] font-medium`}>{label}</span>
              </Link>
            ))
          }
       </div>
    </div>
  )
}

export default SideBar