import api from '../utils/api.js'


export const getMealConfig = async () => {
    try {
        const response = await api.get('/mealconfig')
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}


export const updateMealConfig = async (mealConfigId, data) => {
    try {
        const response = await api.put(`/mealconfig/${mealConfigId}`, data)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}


export const getMealList = async (branchId) => {
    try{
        const response = await api.get(`/meal/monthly/${branchId}`)
        return response.data.mealByDate
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}

export const createMeal = async (data) => {
    try{
        const response = await api.post('/meal', data)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}

export const updateMeal = async (date, branchId, data) =>{
    try{
        const response = await api.put(`/meal/${branchId}/${date}`, data)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}