import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Loader from './components/Loader';

// PWA Components
import { PWAProvider } from './context/PWAContext';
import InstallBanner from './components/InstallBanner';
import InstallButton from './components/InstallButton';
import IOSInstallInstructions from './components/IOSInstallInstructions';

//Importing general components
import Login from './pages/Login';

//Import Admin components 
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Branch from './pages/admin/Branch';
import BranchPreview from './pages/admin/BranchPreview';
import Customer from './pages/admin/Customer';
import Employee from './pages/admin/Employee';
import Accountmanager from './pages/admin/Accountmanager';
import RoomPreview from './pages/admin/RoomPreview';
import CustomerRent from './pages/admin/CustomerRent';
import EmployeeSalary from './pages/admin/EmployeeSalary';
import Inventory from './pages/admin/Inventory';
import MonthlyBill from './pages/admin/MonthlyBill';
import CashOut from './pages/admin/CashOut';
import Transaction from './pages/admin/Transaction';
import Profile from './pages/admin/Profile';
import RentPreview from './pages/admin/RentPreview';
import Meal from './pages/admin/Meal';
import Complaints from './pages/admin/Complaints';
import DailyUpdate from './pages/admin/DailyUpdate';
import Scanner from './pages/admin/Scanner';
import Settings from './pages/admin/Settings';

//Import Account components
import AccountLayout from './layouts/AccountLayout';
import AccountDashboard from './pages/account/AccountDashboard';



function App() {
  const {auth} = useAuth();

  if(auth.loading){
    return (
      <Loader></Loader>
    )
  }

  return (
    <PWAProvider>
      <Router>
        {/* PWA Install Banner */}
        <InstallBanner />
        
        <Routes>

          <Route path='/login' element={<Login></Login>}></Route>
   
          {/* Admin Routes */}
          <Route path='/admin' element={<ProtectedRoute allowed={['Admin']}><AdminLayout></AdminLayout></ProtectedRoute>}
          >
            <Route index element={<AdminDashboard></AdminDashboard>}></Route>
            <Route path='branches' element={<Branch></Branch>}></Route>
            <Route path='branches/preview' element={<BranchPreview></BranchPreview>}></Route>
            <Route path='customers/clist' element={<Customer></Customer>}></Route>
            <Route path='customers/rents' element={<CustomerRent></CustomerRent>}></Route>
            <Route path='customers/meals' element={<Meal></Meal>}></Route>
            <Route path='customers/complaints' element={<Complaints></Complaints>}></Route>
            <Route path='customers/dailyupdate' element={<DailyUpdate></DailyUpdate>}></Route>
            <Route path='employees/elist' element={<Employee></Employee>}></Route>
            <Route path='employees/salary' element={<EmployeeSalary></EmployeeSalary>}></Route>
            <Route path='accountmanagers' element={<Accountmanager></Accountmanager>}></Route>
            <Route path='branches/room/preview' element={<RoomPreview></RoomPreview>}></Route>
            <Route path='rent-preview' element={<RentPreview></RentPreview>}></Route>
            <Route path='inventory' element={<Inventory></Inventory>}></Route>
            <Route path='monthlybill' element={<MonthlyBill></MonthlyBill>}></Route>
            <Route path='cashout' element={<CashOut></CashOut>}></Route>
            <Route path='transactions' element={<Transaction></Transaction>}></Route>
            <Route path='profile' element={<Profile></Profile>}></Route>
            <Route path='scanner' element={<Scanner></Scanner>}></Route>
            <Route path='settings' element={<Settings></Settings>}></Route>
          </Route>
     
         {/* Account Routes */}
         <Route path='/account' element={<ProtectedRoute allowed={['Account']}><AccountLayout></AccountLayout></ProtectedRoute>}>
            <Route index element={<AccountDashboard></AccountDashboard>}></Route>
            <Route path='branches' element={<Branch></Branch>}></Route>
            <Route path='branches/preview' element={<BranchPreview></BranchPreview>}></Route>
            <Route path='branches/room/preview' element={<RoomPreview></RoomPreview>}></Route>
            <Route path='customers/clist' element={<Customer></Customer>}></Route>
            <Route path='customers/rents' element={<CustomerRent></CustomerRent>}></Route>
            <Route path='customers/meals' element={<Meal></Meal>}></Route>
            <Route path='customers/complaints' element={<Complaints></Complaints>}></Route>
            <Route path='customers/dailyupdate' element={<DailyUpdate></DailyUpdate>}></Route>
            <Route path='rent-preview' element={<RentPreview></RentPreview>}></Route>
            <Route path='employees/elist' element={<Employee></Employee>}></Route>
            <Route path='employees/salary' element={<EmployeeSalary></EmployeeSalary>}></Route>
            <Route path='rents' element={<Customer></Customer>}></Route>
            <Route path='salary' element={<EmployeeSalary></EmployeeSalary>}></Route>
            <Route path='inventory' element={<Inventory></Inventory>}></Route>
            <Route path='cashout' element={<CashOut></CashOut>}></Route>
            <Route path='monthlybill' element={<MonthlyBill></MonthlyBill>}></Route>
            <Route path='transactions' element={<Transaction></Transaction>}></Route>
            <Route path='settings' element={<Settings></Settings>}></Route>
         </Route>

         <Route path="*" element={<Navigate to={auth?.user?.userType === 'Admin' ? '/admin' : '/account'} />} />

        </Routes>
        
        {/* PWA Install Button */}
        <InstallButton />
        
        {/* iOS Install Instructions Modal */}
        <IOSInstallInstructions />
      </Router>
    </PWAProvider>
  )
}

export default App
