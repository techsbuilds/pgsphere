import React, {useState, useRef, useEffect, useCallback} from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import { format, addDays, subDays } from "date-fns"
import { getMealList, getMealConfig } from '../../services/mealService';
import { getAllBranch } from '../../services/branchService';
import MealForm from '../../components/MealForm';
import AddMealByXl from '../../components/AddMealByXl';

//Importing icons
import { Calendar, ChevronLeft, Utensils,  ChevronRight, Clock, User, Pen } from 'lucide-react';
import { toast } from 'react-toastify';


function Meal() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [openMealForm, setOpenMealForm] = useState(false)
  const [selectedBranch,setSelectedBranch] = useState(null)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [mealConfig, setMealConfig] = useState(null)
  const [isEdit,setIsEdit] = useState(false)
  const [loader,setLoader] = useState(false)
  const [mealData, setMealData] = useState({})
  const [mealsForSelectedDate, setMealsForSelectedDate] = useState([])
  const [mealDocument, setMealDocument] = useState(null)
  const [openMealXlForm,setOpenMealXlForm] = useState(false)
  const [counts,setCounts] = useState({
    breakfast:0,
    lunch:0,
    dinner:0
  })
  const scrollContainerRef = useRef(null)
  const currentDate = new Date()
  
  // Generate 30 days: 15 days before, current date, 14 days after
  const allDays = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(subDays(currentDate, 15), i)
    return {
      date,
      dayName: format(date, "EEEE"),
      dayNum: format(date, "d"),
      monthShort: format(date, "MMM"),
      fullDate: format(date, "yyyy-MM-dd"),
    }
  })

  // Scroll to selected date when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedIndex = allDays.findIndex(
        day => day.fullDate === format(selectedDate, "yyyy-MM-dd")
      )
      
      if (selectedIndex !== -1) {
        const cardWidth = scrollContainerRef.current.children[0]?.offsetWidth || 0
        const gap = 8 // gap-2 = 0.5rem = 8px
        const scrollPosition = selectedIndex * (cardWidth + gap) - (scrollContainerRef.current.offsetWidth / 2) + (cardWidth / 2)
        
        scrollContainerRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
      }
    }
  }, [selectedDate, allDays])

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.offsetWidth || 0
      const gap = 8
      scrollContainerRef.current.scrollBy({
        left: -(cardWidth * 7 + gap * 7), // Scroll by 7 cards
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.offsetWidth || 0
      const gap = 8
      scrollContainerRef.current.scrollBy({
        left: cardWidth * 7 + gap * 7, // Scroll by 7 cards
        behavior: 'smooth'
      })
    }
  }

  // Function to get meals for selected date and set default meal
  const updateMealsForDate = useCallback((date, data) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dateData = data[dateKey] || {}
    const dateMeals = dateData.meals || []
    setCounts(dateData.counts || {breakfast:0,lunch:0,dinner:0})
    
    if (dateMeals.length > 0 && dateMeals[0].meals) {
      const mealDoc = dateMeals[0]
      const meals = mealDoc.meals
      setMealsForSelectedDate(meals)
      setMealDocument(mealDoc) // Store meal document for updates
      
      // Select default meal: Breakfast first, then first meal
      const breakfastMeal = meals.find(m => m.type?.toLowerCase() === 'breakfast')
      if (breakfastMeal) {
        setSelectedMeal(breakfastMeal)
      } else if (meals.length > 0) {
        setSelectedMeal(meals[0])
      } else {
        setSelectedMeal(null)
      }
    } else {
      setMealsForSelectedDate([])
      setSelectedMeal(null)
      setMealDocument(null)
    }
  }, [])

  useEffect(()=>{
    const handleGetMealList = async () =>{
      try{
        setLoader(true)
        //First get branch data 
        const branchData = await getAllBranch()
        
        // Check if branches exist
        if (!branchData || branchData.length === 0) {
          setMealData({})
          setSelectedBranch('')
          return
        }
        
        setSelectedBranch(branchData[0]._id)
        const data = await getMealList(branchData[0]._id)
        setMealData(data)
        // Update meals for current selected date
        updateMealsForDate(selectedDate, data)
      }catch(err){
        console.log(err)
        toast.error(err?.message)
      } finally {
        setLoader(false)
      }
    }

     handleGetMealList()
  },[])

  // Update meals when selected date changes
  useEffect(() => {
    if (Object.keys(mealData).length > 0) {
      updateMealsForDate(selectedDate, mealData)
    }
  }, [selectedDate, mealData, updateMealsForDate])

  // Refetch meals when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const handleGetMealList = async () => {
        try {
          setLoader(true)
          const data = await getMealList(selectedBranch)
          setMealData(data)
          // Update meals for current selected date after fetching
          updateMealsForDate(selectedDate, data)
        } catch(err) {
          console.log(err)
          toast.error(err?.message)
        } finally {
          setLoader(false)
        }
      }
      handleGetMealList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch])

  const handleOpenMealForm = (edit=false) =>{
    setOpenMealForm(true)
    setIsEdit(edit)
  }

  const handleCloseMealForm = (refresh = false) =>{
    setOpenMealForm(false)
    setIsEdit(false)
    if (refresh && selectedBranch) {
      // Refresh meal list after save
      const handleGetMealList = async () => {
        try {
          setLoader(true)
          const data = await getMealList(selectedBranch)
          setMealData(data)
          updateMealsForDate(selectedDate, data)
        } catch(err) {
          console.log(err)
          toast.error(err?.message)
        } finally {
          setLoader(false)
        }
      }
      handleGetMealList()
    }
  }

  const handleCloseAddMealXlForm = (refresh = false) =>{
    setOpenMealXlForm(false)
    if (refresh && selectedBranch) {
      // Refresh meal list after save
      const handleGetMealList = async () => {
        try {
          setLoader(true)
          const data = await getMealList(selectedBranch)
          setMealData(data)
          updateMealsForDate(selectedDate, data)
        } catch(err) {
          console.log(err)
          toast.error(err?.message)
        } finally {
          setLoader(false)
        }
      }
      handleGetMealList()
    }
  }

  useEffect(()=>{
    const handleGetMealConfig = async () =>{
      try{
        const data = await getMealConfig()
        console.log('meal config', data)
        setMealConfig(data)
      }catch(err){
        console.log(err)
        toast.error(err?.message)
      }
    }
    handleGetMealConfig()
  },[])

  const parseTime = (type) =>{
     if(type === 'Breakfast'){
      return mealConfig?.breakfast_time
     }else if(type === 'Lunch'){
      return mealConfig?.lunch_time
     }else if(type === 'Dinner'){
      return mealConfig?.dinner_time
     }
  }


  return (
    <div className='flex flex-col h-full gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0'>
       <Breadcrumb openExcel={()=>setOpenMealXlForm(true)} onClick={handleOpenMealForm} selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch}></Breadcrumb>
       <MealForm 
         isEdit={isEdit} 
         openForm={openMealForm} 
         selectedMeal={mealsForSelectedDate} 
         selectedDate={selectedDate} 
         mealDocument={mealDocument}
         onClose={handleCloseMealForm}
       />
       <AddMealByXl
        openForm={openMealXlForm}
        onClose={handleCloseAddMealXlForm}
       ></AddMealByXl>
       
      {loader ? (
        <div className='flex flex-col gap-3 sm:gap-4 rounded-2xl bg-white p-3 sm:p-4 animate-pulse'>
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 bg-gray-200 rounded'></div>
            <div className='h-5 bg-gray-200 rounded w-24'></div>
          </div>
          <div className='relative'>
            <div className='flex gap-2 overflow-x-auto pb-2 px-8 sm:px-10'>
              {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <div key={item} className='w-[calc((100%-64px)/7)] sm:w-[calc((100%-80px)/7)] min-w-[80px] sm:min-w-[100px] h-20 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0'></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-3 sm:gap-4 rounded-2xl bg-white p-3 sm:p-4'>
          <div className='flex items-center gap-2'>
            <Calendar size={18} className='sm:w-5 sm:h-5 text-gray-600'></Calendar>
            <h1 className='font-medium text-sm sm:text-base'>Select Date</h1>
          </div>
          
          {/* Date Selection Container with Scroll */}
          <div className='relative'>
            {/* Left Arrow Button */}
            <button
              onClick={scrollLeft}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-gray-50 transition-colors'
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} className='sm:w-5 sm:h-5 text-gray-700' />
            </button>

            {/* Scrollable Date Cards Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 px-8 sm:px-10 scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {allDays.map((day, idx) => {
                const isSelected = format(selectedDate, "yyyy-MM-dd") === day.fullDate
                const isToday = format(currentDate, "yyyy-MM-dd") === day.fullDate
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    className={`w-[calc((100%-64px)/7)] sm:w-[calc((100%-80px)/7)] min-w-[80px] sm:min-w-[100px] p-2 sm:p-3 rounded-lg border-2 transition-all text-center flex-shrink-0 ${
                      isSelected
                        ? "border-[#202947] bg-[#202947] text-white"
                        : isToday
                        ? "border-blue-300 bg-blue-50"
                        : "border-neutral-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`text-[10px] sm:text-xs font-medium ${
                      isSelected ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {day.dayName.substring(0, 3)}
                    </div>
                    <div className='flex justify-center items-center gap-0.5 sm:gap-1 mt-1'>
                      <div className={`text-base sm:text-lg font-bold ${
                        isSelected ? "text-white" : ""
                      }`}>
                        {day.dayNum}
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ${
                        isSelected ? "text-white/90" : ""
                      }`}>
                        {day.monthShort}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={scrollRight}
              className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 sm:p-2 hover:bg-gray-50 transition-colors'
              aria-label="Scroll right"
            >
              <ChevronRight size={18} className='sm:w-5 sm:h-5 text-gray-700' />
            </button>
          </div>

        </div>
      )}
      
      {loader ? (
        <div className='flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4'>
          {/* Menu List Skeleton */}
          <div className='flex w-full lg:w-[70%] min-h-[300px] sm:min-h-[400px] bg-white p-3 sm:p-4 rounded-2xl flex-col gap-3 sm:gap-4 animate-pulse'>
            <div className='flex justify-between items-center gap-2'>
              <div className='flex items-center gap-2 flex-1'>
                <div className='w-5 h-5 bg-gray-200 rounded'></div>
                <div className='h-5 bg-gray-200 rounded w-48 sm:w-64'></div>
              </div>
              <div className='w-5 h-5 bg-gray-200 rounded'></div>
            </div>
            <div className='flex flex-col gap-2'>
              {[1, 2, 3].map((item) => (
                <div key={item} className='p-3 sm:p-4 border-2 border-neutral-200 rounded-2xl'>
                  <div className='flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between'>
                    <div className='flex flex-col gap-2 flex-1'>
                      <div className='h-5 bg-gray-200 rounded w-24'></div>
                      <div className='h-4 bg-gray-200 rounded w-40'></div>
                      <div className='flex flex-col gap-1 mt-1'>
                        <div className='h-3 bg-gray-200 rounded w-16'></div>
                        <div className='flex gap-2 flex-wrap'>
                          <div className='h-6 bg-gray-200 rounded-full w-20'></div>
                          <div className='h-6 bg-gray-200 rounded-full w-24'></div>
                          <div className='h-6 bg-gray-200 rounded-full w-16'></div>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row sm:flex-col items-center sm:items-end gap-2'>
                      <div className='h-4 bg-gray-200 rounded w-32'></div>
                      <div className='h-6 bg-gray-200 rounded-full w-24'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellations Sidebar Skeleton */}
          <div className='flex w-full lg:w-[30%] bg-white rounded-2xl flex-col p-3 sm:p-4 gap-3 sm:gap-4 animate-pulse'>
            <div className='flex flex-col gap-2'>
              <div className='h-5 bg-gray-200 rounded w-40'></div>
              <div className='h-4 bg-gray-200 rounded w-48'></div>
            </div>
            <div className='flex flex-col gap-2'>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className='p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-gray-200 rounded-full'></div>
                    <div className='h-4 bg-gray-200 rounded w-32'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4'>
           <div className='flex w-full lg:w-[70%] min-h-[300px] sm:min-h-[400px] overflow-y-auto bg-white p-3 sm:p-4 rounded-2xl flex-col gap-3 sm:gap-4'>
             <div className='flex justify-between items-start sm:items-center gap-2'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <Utensils size={18} className='sm:w-5 sm:h-5 text-gray-600 flex-shrink-0'></Utensils>
                <h1 className='font-medium text-sm sm:text-base lg:text-lg leading-tight'>
                  Menu for {format(selectedDate, "EEEE")}, {format(selectedDate, "MMM")} {format(selectedDate, "d")}, {selectedDate.getFullYear()}
                </h1>
              </div>
              {
                mealsForSelectedDate.length > 0 && (
                  <button onClick={()=>handleOpenMealForm(true)} className='flex-shrink-0'>
                    <Pen size={18} className='sm:w-5 sm:h-5 text-gray-600 cursor-pointer'></Pen>
                  </button>
                )
              }
             </div>
             <div className='flex flex-col gap-2'>
              {mealsForSelectedDate.length > 0 ? (
                mealsForSelectedDate.map((meal, index) => {
                  const isSelected = selectedMeal?._id === meal._id
                  return (
                    <button
                      key={meal._id || index}
                      onClick={() => setSelectedMeal(meal)}
                      className={`p-3 sm:p-4 flex flex-col sm:flex-row cursor-pointer justify-between border-2 rounded-2xl transition-all text-left gap-3 sm:gap-0 ${
                        isSelected 
                          ? 'border-[#202947] bg-[#202947]/5' 
                          : 'border-neutral-300 hover:border-gray-400'
                      }`}
                    >
                      <div className='flex flex-col gap-2 flex-1 min-w-0'>
                        <div className='flex flex-col gap-1'>
                          <h1 className={`font-medium text-sm sm:text-base ${isSelected ? 'text-[#202947]' : ''}`}>
                            {meal.type || 'Meal'}
                          </h1>
                          <span className='text-[#737373] text-xs sm:text-sm'>
                            {meal.description || 'No description'}
                          </span>
                        </div>
                        <div className='flex flex-col gap-1'>
                          <span className='text-xs sm:text-sm font-medium text-[#737373]'>Items:</span>
                          <div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
                            {meal.items && meal.items.length > 0 ? (
                              meal.items.map((item, itemIndex) => (
                                <span 
                                  key={itemIndex}
                                  className='py-1 sm:py-1.5 text-xs sm:text-sm px-2 sm:px-2.5 rounded-2xl bg-[#fcfcfc]'
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className='text-xs sm:text-sm text-gray-400'>No items</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 flex-shrink-0'>
                        <div className='flex items-center gap-1'>
                          <Clock size={16} className='sm:w-[18px] sm:h-[18px] text-neutral-400'></Clock>
                          <span className='text-neutral-400 text-xs sm:text-sm whitespace-nowrap'>Cancel before {parseTime(meal.type)}</span>
                        </div>
                        <div className='flex flex-col items-end gap-1.5'>
                          <div className='flex items-center gap-2'>
                            <span className='bg-blue-50 text-blue-700 py-1 px-2 text-xs sm:text-sm rounded-2xl whitespace-nowrap font-medium'>
                              {(() => {
                                const mealType = meal.type?.toLowerCase() || '';
                                const count = mealType === 'breakfast' ? counts.breakfast : 
                                             mealType === 'lunch' ? counts.lunch : 
                                             mealType === 'dinner' ? counts.dinner : 0;
                                return `${count} Expected`;
                              })()}
                            </span>
                            <span className='bg-red-50 text-red-700 py-1 px-2 text-xs sm:text-sm rounded-2xl whitespace-nowrap font-medium'>
                              {meal.cancelled ? (meal.cancelled.length > 0 ? `${meal.cancelled.length} Cancelled` : '0 Cancelled') : '0 Cancelled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className='p-6 sm:p-8 h-full text-center text-gray-400'>
                  <p className='text-sm sm:text-base'>No meals available for this date</p>
                </div>
              )}
             </div>
           </div>
           <div className='flex w-full lg:w-[30%] bg-white rounded-2xl flex-col p-3 sm:p-4 gap-3 sm:gap-4'>
              <div className='flex flex-col gap-2'>
                <h1 className='font-medium text-sm sm:text-base'>
                  {selectedMeal ? `${selectedMeal.type} Cancellations` : 'No Meal Selected'}
                </h1>
                <span className='text-xs sm:text-sm text-gray-500'>
                  {selectedMeal?.cancelled?.length > 0 
                    ? `${selectedMeal.cancelled.length} customer${selectedMeal.cancelled.length > 1 ? 's' : ''} cancelled`
                    : selectedMeal 
                    ? '0 customers cancelled'
                    : 'Select a meal to view cancellations'}
                </span>
              </div>
              
              {selectedMeal && selectedMeal.cancelled && selectedMeal.cancelled.length > 0 && (
                <div className='flex flex-col gap-2 mt-2'>
                  <div className='max-h-[300px] sm:max-h-[400px] overflow-y-auto'>
                    {selectedMeal.cancelled.map((customer, index) => (
                      <div 
                        key={customer._id || index}
                        className='p-2 sm:p-3 bg-gray-50 flex items-center gap-2 rounded-lg border border-gray-200'
                      >
                        <User size={16} className='sm:w-[18px] sm:h-[18px] text-gray-700 flex-shrink-0'></User>
                        <p className='text-xs sm:text-sm font-medium text-gray-700 truncate'>
                          {customer.customer_name || 'Unknown Customer'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMeal && (!selectedMeal.cancelled || selectedMeal.cancelled.length === 0) && (
                <div className='flex items-center justify-center py-6 sm:py-8 text-gray-400'>
                  <p className='text-xs sm:text-sm'>No cancellations</p>
                </div>
              )}
           </div>
       </div>
      )}
      
    </div>
  )
}

export default Meal