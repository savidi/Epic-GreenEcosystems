// src/Components/Home/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import Slider from '../Slider/Slider';
import Nav from "../Nav/Nav";
import ManhoursChart from './ManhoursChart';
import AttendanceChart from './AttendanceChart';
import TaskPage from "./TaskPage";

function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => 
    JSON.parse(localStorage.getItem("sidebar-collapsed")) || false
  );

  // Listen for changes in localStorage (when sidebar is toggled)
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
      setSidebarCollapsed(collapsed);
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (in case localStorage changes within same tab)
    const interval = setInterval(() => {
      const collapsed = JSON.parse(localStorage.getItem("sidebar-collapsed")) || false;
      if (collapsed !== sidebarCollapsed) {
        setSidebarCollapsed(collapsed);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  return (
    <div>
      <Nav />
      <div className={`hr-home-container ${sidebarCollapsed ? 'hr-sidebar-collapsed' : ''}`}>
        {/* Top slider section */}
        <section className="hr-home-slider-section">
          <Slider />
        </section>

        {/* Bottom charts section */}
        <div className="hr-home-content-wrapper">
          <div className="hr-home-chart-column">
            <ManhoursChart />
          </div>
          <div className="hr-home-chart-column">
            <AttendanceChart />
          </div>
          <div className="hr-home-chart-column">
            <TaskPage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;