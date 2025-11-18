import React, { useState, useEffect } from 'react'
import Breadcrumb from '../../components/Breadcrumb';
import { getTodayMeal } from '../../services/mealService';
import { getAllComplaints } from '../../services/complaintService';
import { getAllBranch } from '../../services/branchService';
import { toast } from 'react-toastify';
import ComplaintCard from '../../components/ComplaintCard';
import { Utensils, AlertCircle } from 'lucide-react';
import { getDashboardSummery } from '../../services/accountService';


function AccountDashboard() {
  const [mealData, setMealData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loader, setLoader] = useState(false)

  useEffect(()=>{
    const handleGetDashboardSummery = async () => {
      try{
        setLoader(true)
        const data = await getDashboardSummery()
        setDashboardData(data)
      }catch(err){
        toast.error(err?.message)
      }finally{
        setLoader(false)
      }
    }
    handleGetDashboardSummery()
  },[])

  // Format date as DD-MM-YYYY
  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranch();
        setBranches(data);
        // Set first branch as default if available
        if (data.length > 0) {
          setSelectedBranch(data[0]._id);
        }
      } catch (err) {
        console.log(err);
        toast.error(err?.message || 'Failed to fetch branches');
      }
    };
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch today's meal
  useEffect(() => {
    if (selectedBranch) {
      const fetchTodayMeal = async () => {
        setLoadingMeal(true);
        try {
          const today = formatDateForAPI(new Date());
          const data = await getTodayMeal(today, selectedBranch);
          setMealData(data);
        } catch (err) {
          console.log(err);
          // Don't show error if meal doesn't exist for today
          if (err?.response?.status !== 404) {
            toast.error(err?.message || 'Failed to fetch meal data');
          }
          setMealData(null);
        } finally {
          setLoadingMeal(false);
        }
      };
      fetchTodayMeal();
    }
  }, [selectedBranch]);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      setLoadingComplaints(true);
      try {
        const data = await getAllComplaints('', 'Open');
        // Limit to 10 complaints
        setComplaints(data.slice(0, 10));
      } catch (err) {
        console.log(err);
        toast.error(err?.message || 'Failed to fetch complaints');
      } finally {
        setLoadingComplaints(false);
      }
    };
    fetchComplaints();
  }, []);

  const refreshComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const data = await getAllComplaints('', 'Open');
      setComplaints(data.slice(0, 10));
    } catch (err) {
      console.log(err);
      toast.error(err?.message || 'Failed to fetch complaints');
    } finally {
      setLoadingComplaints(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0 h-full overflow-hidden'>
      <Breadcrumb></Breadcrumb>

      {/* Dashboard Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0'>
           <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
              <div className="flex flex-col gap-2 sm:gap-4">
                <span className="text-[#7E7E85] text-sm sm:text-base">Total Branches</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalBranches || 0}</h1>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
              <div className="flex w-full flex-col gap-2 sm:gap-4">
                <span className="text-[#7E7E85] text-sm sm:text-base">Total Customer</span>
                <div className="flex w-full items-center justify-between">
                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalCustomers || 0}</h1>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
              <div className="flex w-full flex-col gap-2 sm:gap-4">
                <span className="text-[#7E7E85] text-sm sm:text-base">Total Rooms</span>
                <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalRooms || 0}</h1>
                <span className="md:py-1.5 py-1 px-1.5  md:px-2 md:text-sm text-xs text-primary bg-slate-100 rounded-md">
                  {dashboardData?.vacantSeats || 0} Vacant Bed
                 </span>
                 </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-white border border-neutral-300 rounded-md flex items-center">
              <div className="flex flex-col gap-2 sm:gap-4">
                <span className="text-[#7E7E85] text-sm sm:text-base">Total Employees</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">{dashboardData?.totalEmployees || 0}</h1>
              </div>
            </div>
      </div>

      {/* Today's Meal and Complaints Section */}
      <div className='flex flex-col flex-1 min-h-0'>
        {/* Header for both sections */}
        <div className='flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0'>
          <h2 className='text-xl sm:text-2xl font-semibold'>Overview</h2>
        </div>

        {/* Two column grid that takes remaining height */}
        <div className='flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0'>
          {/* Today's Meal Section */}
          <div className='bg-white border border-neutral-300 rounded-md p-4 sm:p-6 flex flex-col min-h-0 flex-1'>
            <div className='flex items-center justify-between mb-4 sm:mb-6'>
              <div className='flex items-center gap-2'>
                <Utensils className='text-primary' size={20} />
                <h3 className='text-lg sm:text-xl font-semibold'>Today's Meal</h3>
              </div>
              {branches.length > 0 && (
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className='p-2 px-3 border rounded-lg border-neutral-300 bg-white outline-none text-sm'
                >
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className='flex-1 overflow-y-auto'>
              {loadingMeal ? (
                <div className='flex justify-center items-center py-8'>
                  <span className='text-gray-500'>Loading...</span>
                </div>
              ) : mealData ? (
                <div className='flex flex-col gap-3'>
                  {mealData.meals && mealData.meals.length > 0 ? (
                    mealData.meals[0]?.meals?.map((meal, index) => {
                      // Get count based on meal type
                      const getMealCount = (mealType) => {
                        const typeLower = mealType?.toLowerCase() || '';
                        if (typeLower === 'breakfast') return mealData.counts?.breakfast ?? 0;
                        if (typeLower === 'lunch') return mealData.counts?.lunch ?? 0;
                        if (typeLower === 'dinner') return mealData.counts?.dinner ?? 0;
                        return 0;
                      };

                      const mealCount = getMealCount(meal.type);
                      const cancelledCount = meal.cancelled?.length || 0;

                      return (
                        <div key={meal._id || index} className='p-4 bg-slate-50 rounded-lg border border-neutral-200'>
                          <div className='flex items-center justify-between mb-2'>
                            <h3 className='font-semibold text-sm sm:text-base'>{meal.type}</h3>
                            <div className='flex items-center gap-2'>
                              {mealCount > 0 && (
                                <span className='px-2 py-1 text-xs sm:text-sm text-green-700 bg-green-100 font-medium rounded-md'>
                                  {mealCount} {mealCount === 1 ? 'arriving' : 'arriving'}
                                </span>
                              )}
                              {cancelledCount > 0 && (
                                <span className='px-2 py-1 text-xs sm:text-sm text-red-700 bg-red-100 font-medium rounded-md'>
                                  {cancelledCount} {cancelledCount === 1 ? 'cancelled' : 'cancelled'}
                                </span>
                              )}
                            </div>
                          </div>
                          {meal.description && (
                            <p className='text-xs sm:text-sm text-gray-600 mb-3'>{meal.description}</p>
                          )}
                          {meal.items && meal.items.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {meal.items.map((item, itemIndex) => (
                                <span
                                  key={itemIndex}
                                  className='px-2 py-1 bg-white text-xs sm:text-sm rounded-md border border-neutral-200'
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className='flex justify-center items-center py-8'>
                      <span className='text-gray-500 text-sm'>No meals available for today</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex justify-center items-center py-8'>
                  <span className='text-gray-500 text-sm'>No meal data available for today</span>
                </div>
              )}
            </div>
          </div>

          {/* Complaints Section */}
          <div className='bg-white border border-neutral-300 rounded-md p-4 sm:p-6 flex flex-col min-h-0 flex-1'>
            <div className='flex items-center gap-2 mb-4 sm:mb-6'>
              <AlertCircle className='text-primary' size={20} />
              <h3 className='text-lg sm:text-xl font-semibold'>Complaints</h3>
            </div>

            <div className='flex-1 overflow-y-auto'>
              {loadingComplaints ? (
                <div className='flex justify-center items-center py-8'>
                  <span className='text-gray-500'>Loading...</span>
                </div>
              ) : complaints.length > 0 ? (
                <div className='flex flex-col gap-3'>
                  {complaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint._id}
                      item={complaint}
                      onRefresh={refreshComplaints}
                    />
                  ))}
                </div>
              ) : (
                <div className='flex justify-center items-center py-8'>
                  <span className='text-gray-500 text-sm'>No open complaints</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountDashboard