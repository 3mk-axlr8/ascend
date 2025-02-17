import React from 'react';
import { Navigate, BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Redirect } from 'react-router'
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';
import Layout from './components/Layout';
import Ascend from './pages/Ascend'
import './output.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/help"
            element={
              <Layout>
                <Help />
              </Layout>
            }
          />
          <Route
            path="/ascend"
            element={
              <Layout>
                <Ascend />
              </Layout>
            }
          />
        </Route>

        {/* Redirect unknown URLs to dashboard or login */}
        <Route path="*" 
        element={<Navigate to ="/dashboard"/>}
        />
            
      </Routes>
    </Router>
  );
}

export default App;
