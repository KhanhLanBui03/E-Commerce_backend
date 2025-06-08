import axios from 'axios'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const { backendUrl } = useContext(ShopContext)

  // Check if email format is valid
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check if password is strong (at least 8 characters)
  const isPasswordStrong = (password) => {
    return password.length >= 8
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, {
        email, password
      })

      if (response.data.success) {
        const token = response.data.token
        localStorage.setItem('token', token)
        // Dispatch authChange event to notify Navbar
        window.dispatchEvent(new Event('authChange'))
        toast.success('Login successful!')
        navigate('/orders')
      } else {
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Email validation
    if (!isEmailValid(email)) {
      toast.error('Please enter a valid email')
      setLoading(false)
      return
    }

    // Password strength check
    if (!isPasswordStrong(password)) {
      toast.error('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast.error('Password confirmation does not match!')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password
      })

      if (response.data.success) {
        toast.success('Registration successful! Please login.')
        // Store token if backend returns it upon registration
        const token = response.data.token
        if (token) {
          localStorage.setItem('token', token)
          // Dispatch authChange event to notify Navbar
          window.dispatchEvent(new Event('authChange'))
          navigate('/orders')
        } else {
          setIsRegister(false) // Switch to login form
          // Reset form
          setName('')
          setPassword('')
          setConfirmPassword('')
        }
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response?.data?.message === "User already exists") {
        toast.error('Email is already registered. Please login instead.')
      } else {
        toast.error(error.response?.data?.message || 'An error occurred during registration')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? 'Register' : 'Login'}
        </h2>
        
        {isRegister ? (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          {isRegister ? (
            <p>Already have an account? <button type="button" onClick={() => setIsRegister(false)} className="text-purple-500">Login</button></p>
          ) : (
            <p>Don&apos;t have an account? <button type="button" onClick={() => setIsRegister(true)} className="text-purple-500">Register</button></p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
