// src/Components/Home/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

import Nav from "../Nav/Nav";
import ManhoursChart from './ManhoursChart';
import AttendanceChart from './AttendanceChart';
import TaskPage from "./TaskPage";

function Home() {
  return (
    <div className="home-container">
      <Nav />
      
      <div className="home-content-wrapper">
        <div className="home-charts-container">
           <div className="home-chart-column">
            <ManhoursChart />
          </div>
          <div className="home-chart-column">
            <AttendanceChart />
          </div>
          <div className="home-chart-column">
            <TaskPage /> {/* ✅ Add here */}
          </div>
        </div>
        
        {/* Add other home page content as needed */}
      </div>
    </div>
  );
}

export default Home;