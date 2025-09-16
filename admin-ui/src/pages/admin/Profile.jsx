import React from 'react'

import PersonalDetails from '../../components/PersonalDetails';
import BankAccount from '../../components/BankAccount';


function Profile() {
  return (
    <div className='flex h-full flex-col gap-4'>
        <h1 className='text-3xl font-semibold'>Profile Details</h1>
        <PersonalDetails></PersonalDetails>
        <BankAccount></BankAccount>
    </div>
  )
}

export default Profile