import React, { useState, useEffect } from 'react';
import './slider.css';

// Import local images
import CinnamonImg from '../Images/Cinnamon.png';
import CardamomImg from '../Images/Cardomom.png';
import TurmericImg from '../Images/Turmeric.png';
import PepperImg from '../Images/Pepper.png';
import CbackgroundImg from '../Images/Cbackground.png';
import RedChilliImg from '../Images/RedChilli.png';

function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            title: "CINNAMON",
            description: "Premium cinnamon cultivation with traditional farming methods.",
            image: CinnamonImg
        },
        {
            title: "CARDAMOM ",
            description: "Queen of spices grown in perfect climate conditions.",
            image: CardamomImg
        },
        {
            title: "TURMERIC",
            description: "Golden turmeric with exceptional quality and color.",
            image: TurmericImg
        },
        {
            title: "PEPPER",
            description: "King of spices cultivated with care and expertise.",
            image: PepperImg
        },
        {
            title: "RED CHILI",
            description: "64 hectares of premium spice cultivation.",
            image: RedChilliImg
        },
        {
            title: "SPICE ",
            description: "Diverse spice ecosystem in perfect harmony.",
            image: CbackgroundImg
        }

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
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="slider-container">
            <div className="slide">
                {slides.map((slide, index) => {
                    // position based on relative distance from currentIndex
                    const pos = (index - currentIndex + slides.length) % slides.length;
                    let className = 'item';
                    if (pos === 0) className += ' primary'; // main full slide
                    else if (pos === 1) className += ' secondary'; // second full slide underneath
                    else if (pos === 2) className += ' pos3';
                    else if (pos === 3) className += ' pos4';
                    else if (pos === 4) className += ' pos5';
                    else className += ' hidden';

                    return (
                        <div
                            key={index}
                            className={className}
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="content">
                                <div className="name">{slide.title}</div>
                                <div className="des">{slide.description}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="button">
                <button className="prev" onClick={prevSlide}>←</button>
                <button className="next" onClick={nextSlide}>→</button>
            </div>
        </div>
    );
}

export default Slider;
