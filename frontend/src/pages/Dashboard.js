import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { tool_list } from '../assets/tools';


const Dashboard = () => {
    const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

    useEffect(() => {
      const getUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          setUserEmail("Failed to fetch user data");
          return;
        }
        if (user) {
          setUserEmail(user.email);
        }
      };
  
      getUser();
    }, []);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-500 via-purple-500 via-indigo-500 to-blue-500 p-4">
      <p className="text-gray-600 mb-4">
          Logged in as: <strong>{userEmail || "Fetching user..."}</strong>
        </p>
      <div className=" px-24 mx-auto py-8">

        {/* Tool Grid */}
        <div className="grid gap-18 md:grid-cols-2 lg:grid-cols-4">
          {tool_list.map((tool) => (
            <div 
              key={tool.name} 
              className="bg-gray-100 rounded-lg shadow p-8 flex flex-col items-center"
            >
              <img 
                src={tool.logo} 
                alt={`${tool.name} logo`} 
                className="h-16 w-16 mb-4 object-contain"
              />
              <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
              <p className="text-gray-600 mb-4 text-center">{tool.description}</p>
              <button
                onClick={() => navigate(tool.route)}
                className="bg-gray-500 text-white p-3 rounded hover:bg-gray-600 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors w-full"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
