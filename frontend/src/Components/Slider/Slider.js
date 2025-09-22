import React, { useState, useEffect } from 'react';
import './slider.css';

// Import images
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import CbackgroundImg from '../Images/Cbackground.png';
import RedChilliImg from '../Images/RedChilli.png';

function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        { title: "CINNAMON", description: "Premium cinnamon cultivation with traditional farming methods.", image: CinnamonImg },
        { title: "CARDAMOM", description: "Queen of spices grown in perfect climate conditions.", image: CardamomImg },
        { title: "TURMERIC", description: "Golden turmeric with exceptional quality and color.", image: TurmericImg },
        { title: "PEPPER", description: "King of spices cultivated with care and expertise.", image: PepperImg },
        { title: "SPICE", description: "Diverse spice ecosystem in perfect harmony.", image: CbackgroundImg },
        { title: "RED CHILLI", description: "64 hectares of premium spice cultivation.", image: RedChilliImg }
    ];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 👉 helper to get the real index for preview positions
    const getSlideIndex = (offset) => {
        return (currentIndex + offset + slides.length) % slides.length;
    };

    return (
        <div className="slider-container">
            <div className="slide">
                {/* Primary (full) */}
                <div
                    className="item primary"
                    style={{ backgroundImage: `url(${slides[getSlideIndex(0)].image})` }}
                >
                    <div className="content">
                        <div className="name">{slides[getSlideIndex(0)].title}</div>
                        <div className="des">{slides[getSlideIndex(0)].description}</div>
                        <button>See More</button>
                    </div>
                </div>

                {/* Secondary (next full) */}
                <div
                    className="item secondary"
                    style={{ backgroundImage: `url(${slides[getSlideIndex(1)].image})` }}
                >
                    <div className="content">
                        <div className="name">{slides[getSlideIndex(1)].title}</div>
                        <div className="des">{slides[getSlideIndex(1)].description}</div>
                        <button>See More</button>
                    </div>
                </div>

                {/* Small preview cards */}
                <div
                    className="item pos3"
                    style={{ backgroundImage: `url(${slides[getSlideIndex(2)].image})` }}
                />
                <div
                    className="item pos4"
                    style={{ backgroundImage: `url(${slides[getSlideIndex(3)].image})` }}
                />
                <div
                    className="item pos5"
                    style={{ backgroundImage: `url(${slides[getSlideIndex(4)].image})` }}
                />
            </div>

            {/* Navigation */}
            <div className="button">
                <button className="prev" onClick={prevSlide}>←</button>
                <button className="next" onClick={nextSlide}>→</button>
            </div>
        </div>
    );
}

export default Slider;
