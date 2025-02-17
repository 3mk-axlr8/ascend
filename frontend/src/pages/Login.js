import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-tr from-pink-500 via-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center"> 
        <div className="h-fit w-fit flex flex-col items-center justify-center shadow-lg bg-gray-100/20 p-8 m-auto mt-[25vh]">
        {/* <h2 className='text-2xl font-bold text-gray-800 inline-block pb-1 mb-6'>Login</h2> */}
        
        <form onSubmit={handleLogin} className='flex flex-col gap-8 p-8 rounded max-w-sm mx-auto' >
            <input className = 'bg-white text-gray-800 p-3 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500' type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input className='bg-white text-gray-800 p-3 rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500' type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button className='bg-gray-500 text-white p-3 rounded hover:bg-gray-600 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors' type="submit">Login</button>
        </form>
        {error && <p className='transition-opacity duration-700 ease-out bg-red-50 border-l-4 border-red-600 text-red-800 p-4'>{error}</p>}
        </div>
    </div>
    
  );
};

export default Login;
