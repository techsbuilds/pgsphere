import React, { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X, LoaderCircle, ChevronDown } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { toast } from 'react-toastify'
import { createMeal, updateMeal } from '../services/mealService'
import { getAllBranch } from '../services/branchService'
import MultiSelectDropdown from './MultiSelectDropdown'

function MealForm({ openForm, selectedMeal, selectedDate, isEdit, mealDocument, onClose }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [formDate, setFormDate] = useState(selectedDate || new Date())
  const [selectedBranches, setSelectedBranches] = useState([])
  const [branchOptions, setBranchOptions] = useState([])

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner']
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Calculate min and max dates (today to next 15 days)
  const minDate = format(currentDate, 'yyyy-MM-dd')
  const maxDate = format(addDays(currentDate, 15), 'yyyy-MM-dd')

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranch()
        setBranchOptions(
          data.map((item) => ({ label: item.branch_name, value: item._id }))
        )
      } catch (err) {
        console.log(err)
        toast.error(err?.message || 'Failed to fetch branches')
      }
    }
    if (openForm) {
      fetchBranches()
    }
  }, [openForm])

  // Initialize form when props change
  useEffect(() => {
    if (openForm) {
      if (isEdit && selectedMeal && Array.isArray(selectedMeal) && selectedMeal.length > 0) {
        // Edit mode: populate with existing meals
        // selectedMeal is the meals array from the meal document
        const formattedMeals = selectedMeal.map(meal => ({
          type: meal.type || 'Breakfast',
          description: meal.description || '',
          items: meal.items || [],
          _id: meal._id
        }))
        setMeals(formattedMeals)
        
        // Set branches from meal document if available
        if (mealDocument && mealDocument.branch) {
          const branchIds = Array.isArray(mealDocument.branch) 
            ? mealDocument.branch.map(b => typeof b === 'string' ? b : b._id)
            : [mealDocument.branch]
          setSelectedBranches(branchIds)
        }
      } else {
        // Add mode: start with default Breakfast meal
        setMeals([{
          type: 'Breakfast',
          description: '',
          items: []
        }])
        setSelectedBranches([])
      }
      setFormDate(selectedDate || new Date())
    }
  }, [openForm, isEdit, selectedMeal, selectedDate, mealDocument])

  // Add a new meal
  const handleAddMeal = () => {
    // Find which meal types are already added
    const existingTypes = meals.map(m => m.type)
    const availableTypes = mealTypes.filter(type => !existingTypes.includes(type))
    
    if (availableTypes.length === 0) {
      toast.info('All meal types (Breakfast, Lunch, Dinner) are already added')
      return
    }

    setMeals([...meals, {
      type: availableTypes[0],
      description: '',
      items: []
    }])
  }

  // Remove a meal
  const handleRemoveMeal = (index) => {
    setMeals(meals.filter((_, i) => i !== index))
  }

  // Update meal type
  const handleMealTypeChange = (index, newType) => {
    const updatedMeals = meals.map((meal, i) => {
      if (i === index) {
        return { ...meal, type: newType }
      }
      return meal
    })
    setMeals(updatedMeals)
  }

  // Update meal description
  const handleDescriptionChange = (index, description) => {
    const updatedMeals = meals.map((meal, i) => {
      if (i === index) {
        return { ...meal, description }
      }
      return meal
    })
    setMeals(updatedMeals)
  }

  // Add item to a meal
  const handleAddItem = (mealIndex, item) => {
    if (!item.trim()) return
    
    const updatedMeals = meals.map((meal, i) => {
      if (i === mealIndex) {
        return {
          ...meal,
          items: [...meal.items, item.trim()]
        }
      }
      return meal
    })
    setMeals(updatedMeals)
  }

  // Remove item from a meal
  const handleRemoveItem = (mealIndex, itemIndex) => {
    const updatedMeals = meals.map((meal, i) => {
      if (i === mealIndex) {
        return {
          ...meal,
          items: meal.items.filter((_, idx) => idx !== itemIndex)
        }
      }
      return meal
    })
    setMeals(updatedMeals)
  }

  // Handle item input key press
  const handleItemKeyPress = (e, mealIndex, itemInput, setItemInput) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem(mealIndex, itemInput)
      setItemInput('')
    }
  }

  // Validate form
  const validateForm = () => {
    if (meals.length === 0) {
      toast.error('Please add at least one meal')
      return false
    }

    if (selectedBranches.length === 0) {
      toast.error('Please select at least one branch')
      return false
    }

    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i]
      if (!meal.type) {
        toast.error(`Please select meal type for meal ${i + 1}`)
        return false
      }
      if (!meal.items || meal.items.length === 0) {
        toast.error(`Please add at least one item for ${meal.type}`)
        return false
      }
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const formattedDate = format(formDate, 'yyyy-MM-dd')

      // Format meals for API
      const formattedMeals = meals.map(meal => ({
        type: meal.type,
        description: meal.description.trim(),
        items: meal.items
      }))

      if (isEdit) {
        // Update existing meal - use first branch ID for update endpoint
        // The API might need the meal document ID, but we'll use first branch as fallback
        const updateId = mealDocument?._id || selectedBranches[0]
        await updateMeal(formattedDate, updateId, {
          meals: formattedMeals,
          branch: selectedBranches
        })
        toast.success('Meal updated successfully')
      } else {
        // Create new meal with branch array
        await createMeal({
          date: formattedDate,
          meals: formattedMeals,
          branch: selectedBranches
        })
        toast.success('Meal created successfully')
      }

      // Close form and refresh
      onClose(true)
    } catch (error) {
      console.log(error)
      toast.error(error?.message || 'Failed to save meal')
    } finally {
      setLoading(false)
    }
  }

  if (!openForm) return null

  return (
    <div 
      className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-2 sm:p-4 md:p-6'
      onClick={() => onClose(false)}
    >
      <div 
        className='flex w-full max-w-2xl flex-col gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
          <div className="flex items-center gap-2 sm:gap-3">
          <ChevronLeft 
            size={20} 
            className="sm:w-6 sm:h-6 md:w-7 md:h-7 cursor-pointer flex-shrink-0" 
            onClick={() => onClose(false)}
          />
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold truncate">
            {isEdit ? "Edit Meal Menu" : "Add Meal Menu"}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-gray-600">
          {isEdit ? "Edit" : "Add"} meal menu for {formDate && !isNaN(formDate.getTime()) ? format(formDate, "MMMM d, yyyy") : 'selected date'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          {/* Date and Branch Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Date Input */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <label className="text-xs sm:text-sm md:text-base font-medium">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formDate && !isNaN(formDate.getTime()) ? format(formDate, 'yyyy-MM-dd') : ''}
                min={minDate}
                max={maxDate}
                onChange={(e) => {
                  const dateValue = e.target.value
                  if (dateValue) {
                    const newDate = new Date(dateValue)
                    if (!isNaN(newDate.getTime())) {
                      setFormDate(newDate)
                    }
                  }
                }}
                className="md:p-1.5 p-2 border border-neutral-300 rounded-md outline-none text-sm sm:text-base focus:border-[#202947] focus:ring-1 focus:ring-[#202947]"
                required
              />
            </div>

            {/* Branch Selection */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <label className="text-xs sm:text-sm md:text-base font-medium">
                Branch <span className="text-red-500">*</span>
              </label>
              <MultiSelectDropdown
                options={branchOptions}
                selected={selectedBranches}
                onChange={setSelectedBranches}
                placeholder="Select branches"
              />
            </div>
          </div>

          {/* Meals List */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-2 sm:gap-0">
              <label className="text-xs sm:text-sm md:text-base font-medium">
                Meals <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddMeal}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs sm:text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span>Add Meal</span>
              </button>
            </div>

            {meals.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-xs sm:text-sm">No meals added. Click "Add Meal" to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {meals.map((meal, mealIndex) => (
                  <MealItem
                    key={mealIndex}
                    meal={meal}
                    mealIndex={mealIndex}
                    mealTypes={mealTypes}
                    existingTypes={meals.map(m => m.type)}
                    onTypeChange={handleMealTypeChange}
                    onDescriptionChange={handleDescriptionChange}
                    onAddItem={handleAddItem}
                    onRemoveItem={handleRemoveItem}
                    onRemoveMeal={handleRemoveMeal}
                    onItemKeyPress={handleItemKeyPress}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 p-2.5 sm:p-3 border border-neutral-300 rounded-md text-xs sm:text-sm md:text-base font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-2.5 sm:p-3 bg-primary text-white rounded-md text-xs sm:text-sm md:text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Saving...</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">{isEdit ? 'Update Menu' : 'Add Menu'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Meal Item Component
function MealItem({ 
  meal, 
  mealIndex, 
  mealTypes, 
  existingTypes, 
  onTypeChange, 
  onDescriptionChange, 
  onAddItem, 
  onRemoveItem, 
  onRemoveMeal,
  onItemKeyPress 
}) {
  const [itemInput, setItemInput] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  // Get available meal types (excluding already used types)
  const availableTypes = mealTypes.filter(type => 
    type === meal.type || !existingTypes.includes(type)
  )

  return (
    <div className="p-3 sm:p-4 border-2 border-neutral-200 rounded-lg sm:rounded-xl bg-gray-50">
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium text-gray-700">Meal {mealIndex + 1}</span>
          </div>

          {/* Meal Type Dropdown */}
          <div className="relative mb-2 sm:mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Meal Type <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="w-full p-2.5 sm:p-2 border border-neutral-300 rounded-md outline-none text-xs sm:text-sm flex items-center justify-between focus:border-[#202947] focus:ring-1 focus:ring-[#202947] bg-white"
            >
              <span className="truncate">{meal.type}</span>
              <ChevronDown size={14} className="sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 ml-2" />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onTypeChange(mealIndex, type)
                      setShowTypeDropdown(false)
                    }}
                    className={`w-full text-left p-2.5 sm:p-2 hover:bg-gray-50 text-xs sm:text-sm transition-colors ${
                      meal.type === type ? 'bg-[#202947]/10 font-medium' : ''
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-2 sm:mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Description</label>
            <textarea
              value={meal.description}
              onChange={(e) => onDescriptionChange(mealIndex, e.target.value)}
              className="w-full p-2.5 sm:p-2 border border-neutral-300 rounded-md outline-none text-xs sm:text-sm resize-none focus:border-[#202947] focus:ring-1 focus:ring-[#202947]"
              placeholder="Enter meal description..."
              rows={2}
            />
          </div>

          {/* Items */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Items <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5 sm:gap-2 mb-2">
              <input
                type="text"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyPress={(e) => {
                  onItemKeyPress(e, mealIndex, itemInput, setItemInput)
                }}
                className="flex-1 p-2.5 sm:p-2 border border-neutral-300 rounded-md outline-none text-xs sm:text-sm focus:border-[#202947] focus:ring-1 focus:ring-[#202947]"
                placeholder="Add item..."
              />
              <button
                type="button"
                onClick={() => {
                  onAddItem(mealIndex, itemInput)
                  setItemInput('')
                }}
                className="p-2.5 sm:p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center flex-shrink-0"
                title="Add item"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            
            {/* Display Items */}
            {meal.items && meal.items.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {meal.items.map((item, itemIndex) => (
                  <span
                    key={itemIndex}
                    className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm"
                  >
                    <span className="max-w-[150px] sm:max-w-none truncate">{item}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(mealIndex, itemIndex)}
                      className="ml-0.5 sm:ml-1 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Remove item"
                    >
                      <X size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No items added yet</p>
            )}
          </div>
        </div>

        {/* Remove Meal Button */}
        <button
          type="button"
          onClick={() => onRemoveMeal(mealIndex)}
          className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
          title="Remove meal"
        >
          <X size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

export default MealForm
