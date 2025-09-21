import React from 'react'

import PersonalDetails from '../../components/PersonalDetails';
import BankAccount from '../../components/BankAccount';


function Profile() {
  return (
    <div className='flex flex-col px-2 sm:px-4 lg:px-8 gap-4 sm:gap-6 lg:gap-8 h-full'>
        <h1 className='text-2xl sm:text-3xl font-semibold'>Profile Details</h1>
        <PersonalDetails></PersonalDetails>
        <BankAccount></BankAccount>
    </div>
  )
}

export default Profile