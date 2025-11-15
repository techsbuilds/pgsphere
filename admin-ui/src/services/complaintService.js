import api from "../utils/api"

export const getAllComplaints = async (branch = "", status = "") => {
    try {

        const response = await api.get(`/complaint?branch=${branch}&status=${status}`)
        return response.data.data
    } catch (err) {
        console.log(err)
        const errMessage = err?.response?.data?.message || "Something went wrong."
        throw new Error(errMessage)
    }
}

export const closeComplaints = async (com_id) => {
    try {
        const response = await api.put(`/complaint/${com_id}`)
        return response.data
    } catch (err) {
        console.log(err)
        const errMessage = err?.response?.data?.message || "Something went wrong."
        throw new Error(errMessage)
    }
}