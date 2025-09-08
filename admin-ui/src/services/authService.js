import api from '../utils/api.js'


export const validateToken = async ()=>{
    try{
       const response = await api.post('/auth/validate-token')
       return response.data.data
    }catch(err){
       console.log(err)
       const errMessage = err?.response?.data?.message
       throw new Error(errMessage)
    }
}


export const login = async (data)=>{
    try{
      const response = await api.post('/auth/sign-in',data)
      return response.data.data
    }catch(err){
      console.log(err)
      const errMessage = err?.response?.data?.message
      throw new Error(errMessage)
    }
}


export const verifyOtp = async (data) =>{
   try{
    const response = await api.post('/auth/verify-otp', data)
    return response.data.data
   }catch(err){
    console.log(err)
    const errMessage = err?.response?.data?.message
    throw new Error(errMessage)
   }
}