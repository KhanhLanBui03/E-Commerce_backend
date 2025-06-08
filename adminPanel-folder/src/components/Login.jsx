import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { backendUrl } from '../App.jsx'

const Login = ({setToken}) => {
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const submit = async (e) =>{
        try {
            e.preventDefault()
            
            const response = await axios.post(backendUrl + '/api/user/admin',{email,password})
            if(response.data.success){
                setToken(response.data.token)
            } else{
                toast.error(response.data.message)
            }
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại')
        }
    }

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
        <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
            <h1 className='text-2xl font-bold mb-4'>ADMIN PANEL</h1>
            
            <form onSubmit={submit}>
                <div className='mb-3 min-w-72'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                    <input  onChange={(e) => setEmail(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none ' type = 'email' placeholder='your@email.com' required></input>
                </div>
                <div className='mb-3 min-w-72'>
                    <p>Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type = 'password' placeholder='Enter your password' required></input>
                </div>
                <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type='submit'>Login</button>
            </form>
        </div>
    </div>
  )
}

export default Login