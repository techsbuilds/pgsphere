import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from '../validations/loginSchema';
import { login, verifyOtp } from '../services/authService';
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OtpInput from '../components/OtpInput';

//Importing icons
import { LoaderCircle } from 'lucide-react';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

import LOGO from '../assets/logo.png'


//Importing image
import LOGIN from '../assets/Login1.png'


function Login() {
  const [currentStep,setCurrentStep] = useState(1)
  const [otp,setOtp] = useState("")
  const [emailForOtp, setEmailForOtp] = useState("")
  const navigate = useNavigate()
  const {auth, loginSuccess, loginFailure} = useAuth()
  const [resendSeconds, setResendSeconds] = useState(0)

  useEffect(()=>{
    if(auth.token && auth.user){
      navigate(auth?.user?.userType==="Admin" ? '/admin' : '/account')
    }  
  },[])

  useEffect(()=>{
    if(currentStep !== 2) return
    if(resendSeconds <= 0) return
    const intervalId = setInterval(()=>{
      setResendSeconds((prev)=> prev > 0 ? prev - 1 : 0)
    },1000)
    return ()=> clearInterval(intervalId)
  },[currentStep, resendSeconds])

  

  const {
    register,
    handleSubmit,
    formState: {errors},
    getValues
  } = useForm({
    mode:'onChange',
    resolver: zodResolver(loginSchema)
  })

  const [showPassword,setShowPassword] = useState(false)
  const [loading,setLoading] = useState(false)
  const [resendLoader,setResendLoader] = useState(false)
  

  const handleSendOtp = async () => {
      let formData = getValues()
      try{
        const data = await login(formData)
      }catch(err){
         throw err
      }
  }

  const onSendOtp = async (formData) =>{
    setLoading(true)
    try{
      await handleSendOtp()
      setEmailForOtp(formData?.email || "")
      setCurrentStep((prev)=> prev + 1)
      setResendSeconds(60)
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }    
    setLoading(false)
  }

  const onVerifyOtp = async () => {
    if(!emailForOtp || !otp || otp.length < 4) return
    setLoading(true)
    try{
      const data = await verifyOtp({ email: emailForOtp, otp })
      console.log(data)
      loginSuccess(data)
      navigate(data.userType === "Admin" ? "/admin" : "/account")
    }catch(err){
      console.log(err.message)
      toast.error(err?.message)
    }finally{
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if(resendSeconds > 0) return
    setResendLoader(true)
    await handleSendOtp()
    toast.success("Otp sended successfully.")
    setResendSeconds(60)
    setResendLoader(false)
  }

  const renderForm = () =>{
    switch(currentStep){
      case 1:
        return (
         <form onSubmit={handleSubmit(onSendOtp)} className='flex flex-col gap-4 sm:gap-6'>
         <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm sm:text-base font-medium'>Email Address</label>
              <div className='flex flex-col'>
                <input {...register("email")} type='email' className='p-2 sm:p-3 border rounded-md border-neutral-300 outline-none text-sm sm:text-base' placeholder='you@example.com'></input>
                {errors.email && <span className='text-xs sm:text-sm text-red-500'>{errors.email.message}</span>}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-sm sm:text-base font-medium'>Password</label>
              <div className='flex relative flex-col'>
                <input {...register("password")} type={showPassword?"text":'password'} className='p-2 sm:p-3 border rounded-md border-neutral-300 outline-none text-sm sm:text-base' placeholder='******'></input>
                <span onClick={()=>setShowPassword(!showPassword)} className='absolute cursor-pointer right-2 sm:right-3 top-2 sm:top-3 text-gray-500'>{showPassword ? <EyeOff size={18} className='sm:w-5 sm:h-5'></EyeOff> : <Eye size={18} className='sm:w-5 sm:h-5'></Eye>}</span>
                {errors.password && <span className='text-xs sm:text-sm text-red-500'>{errors.password.message}</span>}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-sm sm:text-base font-medium'>User Type</label>
              <div className='flex flex-col'>
                <select {...register("userType")} className='p-2 sm:p-3 border rounded-md border-neutral-300 outline-none text-sm sm:text-base'>
                 <option value={'Admin'}>Admin</option>
                 <option value={'Account'}>Accountant</option>
                </select>
                {errors.userType && <span className='text-xs sm:text-sm text-red-500'>{errors.userType.message}</span>}
              </div>
            </div>
         </div>
         <div className='flex flex-col gap-2'>
          <button disabled={loading} type='submit' className='p-2 sm:p-3 hover:bg-primary/90 transition-all duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white font-medium text-sm sm:text-base'>
            {
             loading ? 
             <LoaderCircle className='animate-spin w-4 h-4 sm:w-5 sm:h-5'></LoaderCircle>
             :"Log in"
            }
          </button>
          <div>
           <span className='text-xs sm:text-sm text-gray-500'>don't have an account? <a href='https://pgsphere.com/signup' className='text-blue-500 hover:underline'>Sign up</a></span>
          </div>
         </div>
       </form>
        )
     
     case 2:
       return (
        <div className='flex flex-col items-center gap-6 sm:gap-8 px-4'>
            <div className='flex flex-col gap-2 text-center'>
               <label className='text-lg sm:text-xl font-bold'>Two - Factor <br/> authentication </label>
               <span className='text-xs sm:text-sm text-gray-500'>Enter 4-digit code which is sent to <br/> your email address <b>{emailForOtp}</b></span>
            </div>

            <OtpInput
            length={4}
            onChange={(v)=>setOtp(v)}
            />
      
           <div className='flex flex-col gap-3 sm:gap-4 items-center w-full max-w-xs'>
             <button
              onClick={onVerifyOtp}
              disabled={loading || otp.length < 4}
              type='button'
              className='p-2 sm:p-3 hover:bg-primary/90 transition-all w-full sm:w-36 duration-300 cursor-pointer flex justify-center items-center bg-primary rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
            >
              {loading ? <LoaderCircle className='animate-spin w-4 h-4 sm:w-5 sm:h-5'></LoaderCircle> : "Verify & Login"}
            </button>
            {resendSeconds > 0 ? (
              <span className='text-xs sm:text-sm text-gray-500'>Resend in 00:{String(resendSeconds).padStart(2,'0')}</span>
            ) : (
              <span className='text-xs sm:text-sm text-center'>Don't receive code? <button disabled={resendLoader} onClick={handleResend} className='text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer font-semibold'>Send Again</button></span>
            )}
            <button
              type='button'
              onClick={() => setCurrentStep(1)}
              className='text-xs sm:text-sm text-blue-600 hover:underline w-fit'
             >
               Back to login
             </button>
           </div>

        </div>
       )
     
     default: 
       return (
         <div>
           404 - No Page found
         </div>
       )
 
    }
 }
 

  return (
    <div className='w-full h-screen flex flex-col lg:flex-row items-center'>
       <div className='w-full lg:w-1/2 h-full flex justify-center items-center px-4 sm:px-6 lg:px-8'> 
          <div className='w-full max-w-md flex flex-col gap-6'>
          <div className='flex mb-2 flex-col items-center gap-1'>
               <div className='w-full flex justify-center items-center'>
                 <img src={LOGO} alt='logo' className='w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36'></img>
               </div>
               {currentStep === 1 && <span className='text-gray-500 text-center text-sm sm:text-base'>Welcome back! Please login to your account.</span>}
          </div>
           {renderForm()}
          </div>
       </div>
       <div className='w-full lg:w-1/2 hidden lg:flex flex-col justify-center items-center h-full bg-gradient-to-bl from-[#296ceb] via-[#2589db] to-[#1FABC8] relative'>
          <div className='flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8'>
            <div className='mb-8'>
              <img src={LOGIN} alt='login illustration' className='w-full max-w-md h-auto'></img>
            </div>
            <div className='w-full max-w-lg text-left'>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 leading-tight'>Modern Living, Unmatched Comfort.</h1>
              <p className='text-neutral-100 font-light text-sm sm:text-base lg:text-lg leading-relaxed'>Discover a new state of co-living with state-of-the-art amenities and a vibrant community.</p>
            </div>
          </div>
       </div>
    </div>
  )
}

export default Login