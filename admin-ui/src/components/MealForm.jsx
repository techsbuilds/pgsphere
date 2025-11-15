import React, { useState, useEffect } from 'react'
import { ChevronLeft, Plus, X, LoaderCircle, ChevronDown } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { toast } from 'react-toastify'
import { createMeal, updateMeal } from '../services/mealService'

function MealForm({ openForm, selectedMeal, selectedDate, isEdit, selectedBranch, mealDocumentId, onClose }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [formDate, setFormDate] = useState(selectedDate || new Date())

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner']
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Calculate min and max dates (today to next 15 days)
  const minDate = format(currentDate, 'yyyy-MM-dd')
  const maxDate = format(addDays(currentDate, 15), 'yyyy-MM-dd')

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
        
        // Try to get meal document ID from parent if available
        // For now, we'll need to find it from the date
      } else {
        // Add mode: start with default Breakfast meal
        setMeals([{
          type: 'Breakfast',
          description: '',
          items: []
        }])
      }
      setFormDate(selectedDate || new Date())
    }
  }, [openForm, isEdit, selectedMeal, selectedDate])

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

    if (!selectedBranch) {
      toast.error('Please select a branch')
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
        // Update existing meal
        // Note: Based on the service, updateMeal takes (date, branchId, data)
        // Using mealDocumentId if available, otherwise use selectedBranch
        const updateId = mealDocumentId || selectedBranch
        await updateMeal(formattedDate, updateId, {
          meals: formattedMeals
        })
        toast.success('Meal updated successfully')
      } else {
        // Create new meal
        await createMeal({
          date: formattedDate,
          meals: formattedMeals,
          branch: selectedBranch
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
      className='fixed z-50 backdrop-blur-sm inset-0 bg-black/40 flex justify-center items-center p-4 sm:p-6'
      onClick={() => onClose(false)}
    >
      <div 
        className='flex w-full max-w-2xl flex-col gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 max-h-[90vh] overflow-y-auto mx-2 sm:mx-4 my-4'
        onClick={(e) => e.stopPropagation()}
      >
          <div className="flex items-center gap-2">
          <ChevronLeft 
            size={24} 
            className="sm:w-7 sm:h-7 cursor-pointer" 
            onClick={() => onClose(false)}
          />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
            {isEdit ? "Edit Meal Menu" : "Add Meal Menu"}
          </h1>
        </div>

        <p className="text-sm text-gray-600">
          {isEdit ? "Edit" : "Add"} meal menu for {format(formDate, "MMMM d, yyyy")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date Input */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <label className="text-sm sm:text-base font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={format(formDate, 'yyyy-MM-dd')}
              min={minDate}
              max={maxDate}
              onChange={(e) => setFormDate(new Date(e.target.value))}
              className="p-2 sm:p-3 border border-neutral-300 rounded-md outline-none text-sm sm:text-base focus:border-[#202947]"
              required
            />
          </div>

          {/* Meals List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-medium">
                Meals <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddMeal}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                <span>Add Meal</span>
              </button>
            </div>

            {meals.length === 0 ? (
              <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <p>No meals added. Click "Add Meal" to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
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
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 p-2 sm:p-3 border border-neutral-300 rounded-md text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-2 sm:p-3 bg-primary text-white rounded-md text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Saving...</span>
                </>
              ) : (
                isEdit ? 'Update Menu' : 'Add Menu'
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
    <div className="p-4 border-2 border-neutral-200 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Meal {mealIndex + 1}</span>
          </div>

          {/* Meal Type Dropdown */}
          <div className="relative mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Meal Type <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="w-full p-2 border border-neutral-300 rounded-md outline-none text-sm flex items-center justify-between focus:border-[#202947] bg-white"
            >
              <span>{meal.type}</span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {showTypeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onTypeChange(mealIndex, type)
                      setShowTypeDropdown(false)
                    }}
                    className={`w-full text-left p-2 hover:bg-gray-50 text-sm ${
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
          <div className="mb-3">
            <label className="text-xs text-gray-600 mb-1 block">Description</label>
            <textarea
              value={meal.description}
              onChange={(e) => onDescriptionChange(mealIndex, e.target.value)}
              className="w-full p-2 border border-neutral-300 rounded-md outline-none text-sm resize-none focus:border-[#202947]"
              placeholder="Enter meal description..."
              rows={2}
            />
          </div>

          {/* Items */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Items <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyPress={(e) => {
                  onItemKeyPress(e, mealIndex, itemInput, setItemInput)
                }}
                className="flex-1 p-2 border border-neutral-300 rounded-md outline-none text-sm focus:border-[#202947]"
                placeholder="Add item..."
              />
              <button
                type="button"
                onClick={() => {
                  onAddItem(mealIndex, itemInput)
                  setItemInput('')
                }}
                className="p-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {/* Display Items */}
            {meal.items && meal.items.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {meal.items.map((item, itemIndex) => (
                  <span
                    key={itemIndex}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(mealIndex, itemIndex)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={14} />
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
          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Remove meal"
        >
          <X size={18} />
        </button>
        </div>
    </div>
  )
}

export default MealForm
