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
        console.log(err.message)
        toast.error(err?.message)
      }
  }

  const onSendOtp = async (formData) =>{
    setLoading(true)
    await handleSendOtp()
    setEmailForOtp(formData?.email || "")
    setCurrentStep((prev)=> prev + 1)
    setResendSeconds(60)
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
         <form onSubmit={handleSubmit(onSendOtp)} className='flex flex-col gap-6'>
         <div className='flex flex-col gap-4.5'>
            <div className='flex flex-col gap-1'>
              <label>Email Address</label>
              <div className='flex flex-col'>
                <input {...register("email")} type='email' className='p-2 border rounded-md  border-neutral-300 outline-none' placeholder='you@example.com'></input>
                {errors.email && <span className='text-sm text-red-500'>{errors.email.message}</span>}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label>Password</label>
              <div className='flex relative flex-col'>
                <input {...register("password")} type={showPassword?"text":'password'} className='p-2 border rounded-md  border-neutral-300 outline-none' placeholder='******'></input>
                <span onClick={()=>setShowPassword(!showPassword)} className='absolute cursor-pointer right-2 top-3 text-gray-500'>{showPassword ? <EyeOff size={20}></EyeOff> : <Eye size={20}></Eye>}</span>
                {errors.password && <span className='text-sm text-red-500'>{errors.password.message}</span>}
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <label>User Type</label>
              <div className='flex flex-col'>
                <select {...register("userType")} className='p-2 border rounded-md border-neutral-300 outline-none'>
                 <option value={'Admin'}>Admin</option>
                 <option value={'Account'}>Accountant</option>
                </select>
                {errors.userType && <span className='text-sm text-red-500'>{errors.userType.message}</span>}
              </div>
            </div>
         </div>
         <button disabled={loading} type='submit' className='p-2 hover:bg-blue-600 transition-all duration-300 cursor-pointer flex justify-center items-center bg-blue-500 rounded-md text-white font-medium'>
            {
             loading ? 
             <LoaderCircle className='animate-spin'></LoaderCircle>
             :"Log in"
            }
         </button>
       </form>
        )
     
     case 2:
       return (
        <div className='flex flex-col items-center gap-8'>
            <div className='flex flex-col gap-1'>
               <label className='text-xl font-bold text-center'>Two - Factor <br/> authentication </label>
               <span className='text-center'>{<span className='text-sm text-center text-gray-500'>Enter 4-digit code which is sent to <br/> your email address <b>vivekmesuriya6@gmail.com</b></span>}</span>
            </div>

            <OtpInput
            length={4}
            onChange={(v)=>setOtp(v)}
            />
      
           <div className='flex flex-col gap-2.5 items-center'>
             <button
              onClick={onVerifyOtp}
              disabled={loading || otp.length < 4}
              type='button'
              className='p-2 hover:bg-blue-600 transition-all w-32 duration-300 cursor-pointer flex justify-center items-center bg-blue-500 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? <LoaderCircle className='animate-spin'></LoaderCircle> : "Verify & Login"}
            </button>
            {resendSeconds > 0 ? (
              <span className='text-sm text-gray-500'>Resend in 00:{String(resendSeconds).padStart(2,'0')}</span>
            ) : (
              <span className=''>Don't receive code? <button disabled={resendLoader} onClick={handleResend} className='text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer font-semibold'>Send Again</button></span>
            )}
            <button
              type='button'
              onClick={() => setCurrentStep(1)}
              className='text-sm text-blue-600 hover:underline w-fit'
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
    <div className='w-full h-screen flex items-center'>
       <div className='sm:w-1/2 w-full h-full flex justify-center items-center'> 
          <div className='flex flex-col gap-6'>
          <div className='flex mb-2 flex-col items-center gap-1'>
               <div className='w-full flex justify-center items-center'>
                 <img src={LOGO} alt='logo' className='w-36 h-36'></img>
               </div>
               {currentStep === 1 && <span className='text-gray-500'>Welcome back! Please login to your account.</span>}
          </div>
           {renderForm()}
          </div>
       </div>
       <div className='w-1/2 hidden  md:flex flex-col justify-center items-center h-full bg-gradient-to-bl from-[#296ceb] via-[#2589db] to-[#1FABC8]'>
          <img src={LOGIN}></img>
          <div className='w-full py-2 px-6 flex flex-col gap-1'>
             <h1 className='text-3xl font-semibold text-white'>Modern Living, Unmatched Comfort.</h1>
             <p className='text-neutral-100 font-light'>Discover a new state of co-living with state-of-the-art amenities and a vibrant community.</p>
          </div>
       </div>
    </div>
  )
}

export default Login