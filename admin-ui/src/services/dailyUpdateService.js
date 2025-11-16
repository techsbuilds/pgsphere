import api from '../utils/api';

export const getDailyUpdates = async (branch) => {
    try {
        const response = await api.get(`/dailyupdate?branch=${branch}`)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}

export const createDailyUpdate = async (data) => {
    try {
        const response = await api.post('/dailyupdate', data)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}

export const deleteDailyUpdate = async (id) => {
    try{
        const response = await api.delete(`/dailyupdate/${id}`)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}