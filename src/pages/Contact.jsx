import React, { useState } from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewletterBox';

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically make an API call
      setSuccess(true);
      setFormData({
        email: '',
        name: '',
        phone: '',
        message: ''
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justitfy-center md:flex-row gap-10'>
        <img src={assets.contact_img} alt="" className='w-full md:max-w-[480px] shadow-lg rounded-lg' />
        <div className='flex flex-col justify-center items-start gap-6'>
          <div className='border-l-4 border-black pl-4'>
            <p className='font-semibold text-2xl text-gray-800'>Our Store</p>
            <p className='text-gray-500 mt-2'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          </div>

          <div className='flex items-center gap-3 text-gray-600'>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className='text-gray-500'>Tel: +1 202 555 0153</p>
          </div>

          <div className='flex items-center gap-3 text-gray-600'>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className='text-gray-500'>Email: admin@forever.com</p>
          </div>

          <div className='border-l-4 border-black pl-4 mt-4'>
            <p className='font-semibold text-2xl text-gray-800'>Send us your feedback</p>
            <p className='text-gray-500 mt-2'>We'd love to hear from you</p>
          </div>

          <form onSubmit={handleSubmit} className='w-full max-w-lg'>
            <div className='flex flex-col gap-4'>
              <div>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className='flex-1'>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone"
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  rows="4"
                  className={`w-full px-4 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:border-black`}
                ></textarea>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <button 
                type="submit"
                className='bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors'
              >
                Send Message
              </button>

              {success && (
                <div className="text-green-500 text-sm mt-2 flex items-center justify-center animate-fade-in">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Message sent successfully!
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className='mb-20'>
        <div className='text-center mb-8'>
          <h3 className='text-2xl font-semibold text-gray-800'>Visit Our Store</h3>
          <p className='text-gray-500 mt-2'>We'd love to meet you in person</p>
        </div>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199412.4868557!2d-77.119401!3d38.889517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7c6de5af6e45b%3A0xc2524522d4885d2a!2sWashington%2C%20DC!5e0!3m2!1sen!2sus!4v1635959401234!5m2!1sen!2sus"
          width="100%" 
          height="400" 
          style={{border: 0}}
          allowFullScreen="" 
          loading="lazy"
          className='rounded-lg shadow-md'
        ></iframe>
      </div>
    </div>
  )
}

export default Contact