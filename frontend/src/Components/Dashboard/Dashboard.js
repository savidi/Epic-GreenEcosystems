import React from 'react';
import './dashboard.css';
import Slider from '../Slider/Slider';
import { Link } from 'react-router-dom';
import Navfield from "../Navfield/Navfield";

// Import images
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import MapImg from '../Images/map.webp';
import RedCilliImg from '../Images/RedChilli.png';
import CloveImg from '../Images/Clove.png';

function Dashboard() {
    const spices = [
        { name: "Cinnamon", description: "Cinnamon is a spice obtained from the inner bark of several tree species.", image: CinnamonImg },
        { name: "Cardamom", description: "Cardamom is known as the queen of spices, used for its strong flavor and aroma.", image: CardamomImg },
        { name: "Turmeric", description: "Turmeric is a bright yellow spice commonly used in Asian cuisine and traditional medicine.", image: TurmericImg },
        { name: "Pepper", description: "Black pepper is the world’s most traded spice and often called the king of spices.", image: PepperImg },
        { name: "Clove", description: "Clove is a spice made from the flower buds of a tree in the family Myrtaceae.", image: CloveImg }, // replace later
        { name: "Red Chili", description: "Red chili peppers are used to add heat and flavor to dishes worldwide.", image: RedCilliImg }, // replace later
    ];

    const stats = [
        { title: "Total Land Area", value: "64 Hectares" },
        { title: "Spices Grown", value: "6 Types" },
        { title: "Active Workers", value: "120+" },
        { title: "Next Harvest", value: "October 2025" },
    ];

    const activities = [
        "Cinnamon fields fertilized on Aug 30",
        "Pepper irrigation completed on Sep 1",
        "Turmeric harvest expected mid-Sep",
        "New workers assigned to Chili plantation",
    ];

    return (
        <div className="dash-container">

             <Navfield />
            <div className="dash-content">
                {/* Slider Section */}
                <section className="dash-slider-section">
                    <Slider />
                </section>
                {/* Stats Section */}
                <section className="dash-section dash-stats-section">
                    <h2>Farm Overview</h2>
                    <div className="dash-stats-cards">
                        {stats.map((stat, index) => (
                            <div key={index} className="dash-stat-card">
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
                            </div>
                        ))}
                    </div>
                </section>

                                   {/* Land Map Section */}
                                   <section className="dash-map-section">
                        <h2>Farm Map</h2>
                        <img src={MapImg} alt="Farm Land Map" className="dash-map-img" />
                    </section>

                {/* Spices Section */}
                <section className="dash-section dash-spice-section">
                    <h2>Our Spices</h2>
                    <div className="dash-spice-cards">
                        {spices.map((spice, index) => (
                            <Link to={`/spices/${spice.name.toLowerCase()}`} key={index} className="dash-spice-card">
                                <img src={spice.image} alt={spice.name} className="dash-spice-img" />
                                <div className="dash-spice-info">
                                    <h3>{spice.name}</h3>
                                    <p>{spice.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="dash-grid">
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
