// src/Components/Home/Home.js
import React from 'react';
import './Home.css';
import Slider from '../Slider/Slider';
import Nav from "../Nav/Nav";
import ManhoursChart from './ManhoursChart';
import AttendanceChart from './AttendanceChart';
import TaskPage from "./TaskPage";

function Home() {
  return (
    <div className="home-container">
      <Nav />

      {/* Top slider section */}
      <section className="home-slider-section">
        <Slider />
      </section>

      {/* Bottom charts section */}
      <div className="home-content-wrapper">
        <div className="home-chart-column">
          <ManhoursChart />
        </div>
        <div className="home-chart-column">
          <AttendanceChart />
        </div>
        <div className="home-chart-column">
          <TaskPage />
        </div>
      </div>
    </div>
  );
}

export default Home;
