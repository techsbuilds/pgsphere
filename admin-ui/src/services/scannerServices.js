import api from "../utils/api"

export const getAllScanner = async (searchQuery = "") => {
    try {
        const response = await api.get(`/scanner?searchQuery=${searchQuery}`)
        return response.data.data
    } catch (error) {
        console.log(error)
        const errMessage = error?.response?.data?.message || "Something went wrong."
        throw new Error(errMessage)
    }
}


export const createScanner = async (scannerData) => {
    try {
        const response = await api.post('/scanner', scannerData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
        )
        return response.data.data
    } catch (err) {
        console.log(err)
        const errMessage = err?.response?.data?.message || "Something went wrong."
        throw new Error(errMessage)
    }
}

export const updateScanner = async (scannerData, scannerId) => {
    try {
        const response = await api.put(`/scanner/${scannerId}`, scannerData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data.data
    } catch (err) {
        console.log(err)
        const errMessage = err?.response?.data?.message || "Something went wrong."
        throw new Error(errMessage)
    }
}