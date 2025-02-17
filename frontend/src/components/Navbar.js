import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-24 py-4 flex justify-between items-center">
      <div >
        <Link className="mr-4 hover:text-gray-300" to="/dashboard">
          Dashboard
        </Link>
        <Link className="mr-4 hover:text-gray-300" to="/help">
          Help
        </Link>
      </div>
      <div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
