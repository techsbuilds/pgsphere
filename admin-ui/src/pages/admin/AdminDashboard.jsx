import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import Chart from "../../components/Chart";

//Importing icons
import { UserRound } from 'lucide-react';

import { toast } from 'react-toastify'
import { getDashboardSummery } from "../../services/adminService";
import { convertIntoRupees } from "../../helper";

function AdminDashboard() {
  const [view, setView] = useState("monthly");
  const [dashboardData,setDashboardData] = useState({
    monthlyData: [
      { month: "Jan", profit: 0, Expenditure: 0 },
      { month: "Feb", profit: 0, Expenditure: 0 },
      { month: "Mar", profit: 0, Expenditure: 0 },
      { month: "Apr", profit: 0, Expenditure: 0 },
      { month: "May", profit: 0, Expenditure: 0 },
      { month: "Jun", profit: 0, Expenditure: 0 },
      { month: "Jul", profit: 0, Expenditure: 0 },
      { month: "Aug", profit: 0, Expenditure: 0 },
      { month: "Sep", profit: 0, Expenditure: 0 },
      { month: "Oct", profit: 0, Expenditure: 0 },
      { month: "Nov", profit: 0, Expenditure: 0 },
      { month: "Dec", profit: 0, Expenditure: 0 },
    ],
    yearlyData: [
      { year: 2025, profit: 0, Expenditure: 0 },
      { year: 2024, profit: 0, Expenditure: 0 },
      { year: 2023, profit: 0, Expenditure: 0 },
      { year: 2022, profit: 0, Expenditure: 0 },
    ],
  })


  useEffect(()=>{
    const handleGetDashboardSummery = async () =>{
       try{
         const data = await getDashboardSummery()
         setDashboardData(data)
       }catch(err){
         toast.error(err?.message)
       }
    }

    handleGetDashboardSummery()
  },[])

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0">
      <Breadcrumb></Breadcrumb>

      {/* State Card */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
          <div className="flex flex-col gap-2 sm:gap-4">
            <span className="text-[#7E7E85] text-sm sm:text-base">Total Branches</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalBranch}</h1>
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
          <div className="flex flex-col gap-2 sm:gap-4">
            <span className="text-[#7E7E85] text-sm sm:text-base">Total Customer</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalCustomers}</h1>
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
          <div className="flex flex-col gap-2 sm:gap-4">
            <span className="text-[#7E7E85] text-sm sm:text-base">Total Employees</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalEmployees}</h1>
          </div>
        </div>
        <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
          <div className="flex flex-col gap-2 sm:gap-4">
            <span className="text-[#7E7E85] text-sm sm:text-base">Total Account Manager</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData.totalAcmanagers}</h1>
          </div>
        </div>
      </div>

      {/* Analytic */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Analytics</h1>
          <div className="relative inline-flex bg-gray-100 rounded-xl p-1 w-full sm:w-56">
            {/* Sliding background */}
            <span
              className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-white shadow-sm transition-transform duration-300`}
              style={{
                transform:
                  view === "monthly"
                    ? "translateX(0%)"
                    : "translateX(100%)",
              }}
            ></span>

            {/* Buttons */}
            <button
              onClick={() => setView("monthly")}
              className={`relative z-10 flex-1 text-center py-2 font-medium transition-colors text-sm sm:text-base ${
                view === "monthly" ? "text-[#2b7fff]" : "text-gray-500 cursor-pointer"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setView("yearly")}
              className={`relative z-10 flex-1 text-center py-2 font-medium transition-colors text-sm sm:text-base ${
                view === "yearly" ? "text-[#2b7fff]" : "text-gray-500 cursor-pointer"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex-1">
            <Chart view={view} chartDataJson={dashboardData}></Chart>
          </div>
          <div className="w-full lg:w-5/12 border flex flex-col gap-3 sm:gap-4 rounded-md border-neutral-300 bg-white p-3 sm:p-4">
            <div className="flex flex-col items-center">
              <h1 className="text-base sm:text-lg text-[#71717a] font-medium">Current Balance</h1>
              <h1 className="text-lg sm:text-xl font-bold">{convertIntoRupees(dashboardData?.current_balance)}</h1>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 items-center">
               <div className="flex flex-col items-center">
                 <span className="text-xs sm:text-sm text-[#71717a] font-medium">Total Profits</span>
                 <span className="font-bold text-sm sm:text-base">{convertIntoRupees(view === "monthly"? dashboardData?.total_current_year_profit :dashboardData?.total_profit)}</span>
               </div>
               <div className="flex flex-col items-center">
                 <span className="text-xs sm:text-sm text-[#71717a] font-medium">Total Expenses</span>
                 <span className="font-bold text-sm sm:text-base">{convertIntoRupees(view === "monthly"? dashboardData?.total_current_year_expenditure :dashboardData?.total_expenditure)}</span>
               </div>
            </div>
            <div className="flex h-full flex-col gap-2">
               <h1 className="text-sm sm:text-base font-medium">Accounts</h1>
               <div className="h-32 sm:h-40 lg:h-48 flex flex-col gap-2 overflow-scroll">
                 {
                  dashboardData?.accounts?.map((account, index) =>(
                   <div key={index} className="flex bg-neutral-100 rounded-md justify-between items-center p-2">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 sm:h-8 sm:w-8 bg-white flex justify-center items-center rounded-full">
                         <UserRound size={16} className="sm:w-6 sm:h-6 text-gray-500"></UserRound>
                       </div>
                       <span className="text-xs sm:text-sm truncate">{account?.account_holdername}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{convertIntoRupees(account.current_balance)}</span>
                  </div>
                  ))
                 }
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
