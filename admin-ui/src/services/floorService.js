import api from '../utils/api.js';

export const createFloor = async (data) => {
    try{
        const response = await api.post('/floor', data)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}

export const getAllFloors = async (branchId) => {
    try{
        const response = await api.get(`/floor/${branchId}`)
        return response.data.data
    }catch(err){
        console.log(err)
        const errMessage = err?.response?.data?.message
        throw new Error(errMessage)
    }
}