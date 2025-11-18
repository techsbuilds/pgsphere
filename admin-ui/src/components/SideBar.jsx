import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  IdCardLanyard,
  ShieldUser,
  Coins,
  Wallet,
  Box,
  BookText,
  HandCoins,
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Settings,
  QrCode,
  X
} from "lucide-react";
import LOGO from "../assets/logo1.png";

const adminRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    link: "/admin",
  },
  {
    label: "Branches",
    icon: Building2,
    link: "/admin/branches",
  },
  {
    label: "Customers",
    icon: Users,
    children: [
      { label: "Customers", link: "/admin/customers/clist" },
      { label: "Rents", link: "/admin/customers/rents" },
      { label: "Meals", link: "/admin/customers/meals" },
      { label: "Complaints", link: "/admin/customers/complaints" },
      { label: "Daily Update", link: "/admin/customers/dailyupdate" },
    ],
  },
  {
    label: "Employees",
    icon: IdCardLanyard,
    children: [
      { label: "Employees", link: "/admin/employees/elist" },
      { label: "Salary", link: "/admin/employees/salary" },
    ],
  },
  {
    label: "Account Managers",
    icon: ShieldUser,
    link: "/admin/accountmanagers",
  },
  {
    label: "Inventory",
    icon: Box,
    link: "/admin/inventory",
  },
  {
    label: "Monthly Bills",
    icon: BookText,
    link: "/admin/monthlybill",
  },
  {
    label: "Cashout",
    icon: HandCoins,
    link: "/admin/cashout",
  },
  {
    label: "Scanner",
    icon: QrCode,
    link: "/admin/scanner",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    link: "/admin/transactions",
  },
  {
    label: "Settings",
    icon: Settings,
    link: "/admin/settings",
  },
];

const accountRoutes = [
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
    children: [
      { label: "Customers", link: "/account/customers/clist" },
      { label: "Rents", link: "/account/customers/rents" },
      { label: "Meals", link: "/account/customers/meals" },
      { label: "Complaints", link: "/account/customers/complaints" },
      { label: "Daily Update", link: "/account/customers/dailyupdate" },
    ],
  },
  {
    label: "Employees",
    icon: IdCardLanyard,
    children: [
      { label: "Employees", link: "/account/employees/elist" },
      { label: "Salary", link: "/account/employees/salary" },
    ],
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
    label: "Cashout",
    icon: HandCoins,
    link: "/account/cashout",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    link: "/account/transactions",
  },
  {
    label: "Settings",
    icon: Settings,
    link: "/account/settings",
  },
];

function SideBar({ showSideBar, setShowSideBar, type }) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  const isActive = (label, link, children) => {
    if(location.pathname === link) return true
    
    // Check if any child route is active
    if(children) {
      return children.some(child => location.pathname === child.link)
    }

    return false
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setShowSideBar(false);
    }
  };

  const routes = type === 'account' ? accountRoutes : adminRoutes;

  return (
    <div
      className={`w-64 bg-[#202947] border-r border-neutral-200 fixed top-0 ${
        showSideBar ? "left-0" : "-left-64"
      } bottom-0 z-50 transition-all duration-300 ease-in-out`}
    >
      {/* Logo Section */}
      <div className="h-16 relative w-full flex border-b border-[#383e59] justify-start items-center p-4">
        <div className="flex items-center gap-4">
          <div className="flex rounded-2xl bg-white justify-center items-center">
            <img className="w-12 h-12" src={LOGO} alt="logo" />
          </div>
          <h1 className="text-white text-xl font-semibold">Pgsphere</h1>
        </div>
        <button
          onClick={() => setShowSideBar(false)}
          className="p-1 right-1 absolute hover:bg-gray-100 rounded-md"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable Menu Section */}
      <div className="flex flex-col p-4 gap-4 overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {routes.map(({ label, icon: Icon, link, children }, index) => (
          <div key={index} className="flex flex-col">
            {/* Parent Link / Toggle */}
            <div
              onClick={() => (children ? toggleSubmenu(label) : handleLinkClick())}
              className={`group flex p-2 px-4 items-center justify-between hover:bg-white gap-2 rounded-full cursor-pointer ${
                isActive(label, link, children) ? "bg-white" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={`${
                    isActive(label, link, children)
                      ? "text-[#202947]"
                      : "text-[#a2a6ba]"
                  } group-hover:text-[#202947]`}
                  size={20}
                />
                {link ? (
                  <Link
                    to={link}
                    onClick={handleLinkClick}
                    className={`${
                      isActive(label, link, children)
                        ? "text-[#202947]"
                        : "text-[#a2a6ba]"
                    } group-hover:text-[#202947] font-medium`}
                  >
                    {label}
                  </Link>
                ) : (
                  <span
                    className={`${
                      isActive(label, link, children)
                        ? "text-[#202947]"
                        : "text-[#a2a6ba]"
                    } group-hover:text-[#202947] font-medium`}
                  >
                    {label}
                  </span>
                )}
              </div>
              {children && (
                <div
                  className={`transition-transform duration-300 ${
                    openSubmenu === label ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown
                    className={`${
                      isActive(label, link, children)
                        ? "text-[#202947]"
                        : "text-[#a2a6ba]"
                    }`}
                    size={18}
                  />
                </div>
              )}
            </div>

            {/* Submenu Section */}
            {children && (
              <div
                className={`ml-8 overflow-hidden transition-all duration-300 ease-in-out ${
                  openSubmenu === label ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {children.map((sub, i) => (
                  <Link
                    key={i}
                    to={sub.link}
                    onClick={handleLinkClick}
                    className={`hover:text-[#202947] flex mt-2 items-center p-1.5 text-sm rounded-lg hover:bg-white/80 ${
                      isActive(sub.label, sub.link)
                        ? "bg-white text-[#202947]"
                        : "text-[#a2a6ba]"
                    }`}
                  >
                    • {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
