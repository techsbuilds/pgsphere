import { ChevronRight, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllBranch } from "../services/branchService";

function Breadcrumb({
  selectedBranch,
  setSelectedBranch,
  searchQuery,
  setSearchQuery,
  selectedTransactions,
  setSelectedTransactions,
  onClick,
}) {
  const location = useLocation();
  const navigate = useNavigate()
  const [branch, setBranch] = useState([]);

  useEffect(() => {
    const handleGetAllBranch = async () => {
      try {
        const data = await getAllBranch();
        setBranch(data);
      } catch (err) {
        console.log(err);
      }
    };

    handleGetAllBranch();
  }, []);

  const getContent = () => {
    switch (location.pathname) {
      case "/admin":
        return <h1 className="text-3xl font-semibold">Dashboard</h1>;

      case "/admin/branches":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Branches</h1>
              {/* Desktop: Show search and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search branch"
                  ></input>
                </div>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Add New Branch
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search only */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 h-10">
                <Search className="text-gray-500" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none"
                  placeholder="Search branch"
                ></input>
              </div>
            </div>
          </>
        );

      case "/admin/branches/preview":
      case "/account/branches/preview":
        return (
          <div className="flex w-full flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Branch Preview
            </h1>
            <span className="text-gray-400">
              View and manage details for your branch.
            </span>
          </div>
        );

      case "/account/customers/clist":
      case "/admin/customers/clist":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Customers</h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl h-10 border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search customers"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-50 px-4 h-10 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Add New Customer
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search customers"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/employees/elist":
      case "/account/employees/elist":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Employees</h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search employees"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Add New Employee
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search employees"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/accountmanagers":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">
                Account Managers
              </h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search account managers"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Add New AcManager
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search account managers"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/customers/rents":
      case "/account/customers/rents":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Pending Rents</h1>
              {/* Desktop: Show search and filter on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search customer"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search customer"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case '/admin/rent-preview':
      case '/account/rent-preview':
        return (
          <div className="w-full flex items-center gap-2">
            <span className="cursor-pointer hover:text-blue-500" onClick={() => navigate(-1)}>Rent</span>
            <ChevronRight className="w-4 h-4 text-gray-500"></ChevronRight>
            <span className="font-semibold">Rent Preview</span>
          </div>
        );

      case "/admin/employees/salary":
      case "/account/employees/salary":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">
                Employee Salary
              </h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search employee"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Create Salary
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search employee"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/inventory":
      case "/account/inventory":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Inventory</h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search inventory"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Create Inventory
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search inventory"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/monthlybill":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Monthly Bills</h1>
              {/* Desktop: Show search, filter and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search bill"
                  ></input>
                </div>
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Create Bill
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search and filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search bill"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "/admin/cashout":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Cashout</h1>
              {/* Desktop: Show search and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search by person name"
                  ></input>
                </div>
                <button
                  onClick={() => onClick()}
                  className="p-2 px-4 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Create Cashout
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search only */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 h-10">
                <Search className="text-gray-500" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none"
                  placeholder="Search by person name"
                ></input>
              </div>
            </div>
          </>
        );

      case "/admin/transactions":
      case "/account/transactions":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Transactions</h1>
              {/* Desktop: Show filters on right */}
              <div className="hidden md:flex items-center gap-2">
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedTransactions}
                  onChange={(e) => setSelectedTransactions(e.target.value)}
                  className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                >
                  <option value={""}>All Transaction</option>
                  <option value={"customer_rent"}>Rent</option>
                  <option value={"employee_salary"}>Salary</option>
                  <option value={"monthly_bill"}>Monthly Bill</option>
                  <option value={"inventory_purchase"}>Inventory</option>
                  <option value={"cash_given"}>Cashout</option>
                </select>
              </div>
            </div>

            {/* Mobile: Bottom row with filters */}
            <div className="md:hidden flex items-center gap-2">
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedTransactions}
                onChange={(e) => setSelectedTransactions(e.target.value)}
                className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
              >
                <option value={""}>All Transaction</option>
                <option value={"customer_rent"}>Rent</option>
                <option value={"employee_salary"}>Salary</option>
                <option value={"monthly_bill"}>Monthly Bill</option>
                <option value={"inventory_purchase"}>Inventory</option>
                <option value={"cash_given"}>Cashout</option>
              </select>
            </div>
          </>
        );

      case "/account/branches":
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl md:text-3xl font-semibold">Branches</h1>
            <div className="flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 md:p-2 w-48 md:w-72  flex items-center gap-2">
                <Search className="text-gray-500" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none"
                  placeholder="Search branch"
                ></input>
              </div>
            </div>
          </div>
        );

      case "/account/monthlybill":
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Monthly Bills
            </h1>
            <div className="flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 md:p-2 w-48 md:w-72  flex items-center gap-2">
                <Search className="text-gray-500" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none"
                  placeholder="Search bill"
                ></input>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                value={selectedBranch}
                className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
              >
                <option value={""}>All Branch</option>
                {branch.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case "/admin/scanner":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Scanner</h1>
              {/* Desktop: Show search and add button on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search branch"
                  ></input>
                </div>
                <button
                  onClick={() => onClick()}
                  className="p-2 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white"
                >
                  Add Scanner
                </button>
              </div>
              {/* Mobile: Show only add button on right */}
              <button
                onClick={() => onClick()}
                className="md:hidden px-3 py-1.5 bg-blue-500 transition-all duration-300 hover:bg-blue-600 font-medium cursor-pointer backdrop-blur-md rounded-md text-white text-sm"
              >
                Add
              </button>
            </div>

            {/* Mobile: Bottom row with search only */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 h-10">
                <Search className="text-gray-500" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none"
                  placeholder="Search branch"
                ></input>
              </div>
            </div>
          </>
        );

      case "/admin/settings":
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl md:text-3xl font-semibold">Settings</h1>
          </div>
        )

      case "/admin/customers/complaints":
        return (
          <>
            {/* Title Row */}
            <div className="flex justify-between items-center w-full">
              <h1 className="text-2xl md:text-3xl font-semibold">Complaints</h1>
              {/* Desktop: Show search and branch filter on right */}
              <div className="hidden md:flex items-center gap-2">
                <div className="border rounded-2xl border-neutral-300 bg-white p-2 w-72 flex items-center gap-2">
                  <Search className="text-gray-500" size={20}></Search>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    className="flex-1 outline-none"
                    placeholder="Search complaint"
                  ></input>
                </div>
                {setSelectedBranch && (
                  <select
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    value={selectedBranch || ""}
                    className="p-2 w-52 px-4 border rounded-2xl border-neutral-300 bg-white outline-none"
                  >
                    <option value={""}>All Branch</option>
                    {branch.map((item, index) => (
                      <option key={index} value={item._id}>
                        {item.branch_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Mobile: Bottom row with search and branch filter */}
            <div className="md:hidden flex items-center gap-2">
              <div className="border rounded-2xl border-neutral-300 bg-white p-1.5 flex-1 flex items-center gap-2 min-w-0 h-10">
                <Search className="text-gray-500 flex-shrink-0" size={20}></Search>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  className="flex-1 outline-none min-w-0"
                  placeholder="Search complaint"
                ></input>
              </div>
              {setSelectedBranch && (
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch || ""}
                  className="p-1.5 flex-1 px-2 border rounded-2xl border-neutral-300 bg-white outline-none text-sm min-w-0 h-10"
                >
                  <option value={""}>All Branch</option>
                  {branch.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.branch_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        )
    }
  };

  return <div className="p-2 flex flex-col gap-3">{getContent()}</div>;
}

export default Breadcrumb;
