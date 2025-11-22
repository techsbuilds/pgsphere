import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { useState, useEffect } from "react";

function AccountLayout() {
  const [showSideBar,setShowSideBar] = useState(true)

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSideBar(false)
      } else {
        setShowSideBar(true) // Keep sidebar open on desktop
      }
    }

    // Set initial state based on screen size
    if (window.innerWidth < 768) {
      setShowSideBar(false) // Closed on mobile
    } else {
      setShowSideBar(true) // Open on desktop
    }
    
    // Listen for resize events
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when clicking outside on mobile
  const handleMainClick = () => {
    if (window.innerWidth < 768 && showSideBar) {
      setShowSideBar(false)
    }
  }

  return (
    <div className="flex relative w-screen h-screen overflow-hidden">
        <SideBar showSideBar={showSideBar} setShowSideBar={setShowSideBar} type='account'></SideBar>
        <main className={`flex relative overflow-y-auto w-full flex-col ml-0 ${showSideBar ? 'md:ml-64' : 'md:ml-0'} h-full transition-all duration-300 ease-in-out`} onClick={handleMainClick}>
            <Header setShowSideBar={setShowSideBar} showSideBar={showSideBar}></Header>
            <div className="md:p-6 p-3 mt-16 w-full overflow-y-auto flex-1 bg-[#F9FAFB]">
              <Outlet></Outlet>
            </div>
        </main>
    </div>
  )
}

export default AccountLayout