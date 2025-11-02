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