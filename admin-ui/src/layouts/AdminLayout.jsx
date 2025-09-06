import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import { useState } from "react";

function AdminLayout() {
  const [showSideBar,setShowSideBar] = useState(false)



  return (
    <div className="flex relative w-screen h-screen overflow-hidden">
        <SideBar showSideBar={showSideBar} type='admin'></SideBar>
        <main className="flex relative w-full flex-col ml-0 md:ml-64 h-full">
            <Header setShowSideBar={setShowSideBar}></Header>
            <div className="p-6 mt-16 w-full overflow-y-auto flex-1 bg-[#F9FAFB]">
              <Outlet></Outlet>
            </div>
        </main>
    </div>
  )
}

export default AdminLayout