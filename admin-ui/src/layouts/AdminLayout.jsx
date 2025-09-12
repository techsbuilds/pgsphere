import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { useState, useEffect } from "react";

function AdminLayout() {
  const [showSideBar,setShowSideBar] = useState(true)

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSideBar(false)
      }
      // Don't force open on desktop - let user control it
    }

    // Set initial state only for mobile
    if (window.innerWidth < 768) {
      setShowSideBar(false)
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
        <SideBar showSideBar={showSideBar} setShowSideBar={setShowSideBar} type='admin'></SideBar>
        <main className={`flex relative w-full flex-col ml-0 ${showSideBar ? 'md:ml-64' : 'md:ml-0'} h-full transition-all duration-300 ease-in-out`} onClick={handleMainClick}>
            <Header setShowSideBar={setShowSideBar} showSideBar={showSideBar}></Header>
            <div className="p-6 mt-16 w-full overflow-y-auto flex-1 bg-[#F9FAFB]">
              <Outlet></Outlet>
            </div>
        </main>
    </div>
  )
}

export default AdminLayout