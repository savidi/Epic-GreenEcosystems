import React from 'react';
import './CusHome.css';
import { Link } from 'react-router-dom';
import {  FaStar } from 'react-icons/fa';
import SpiceVideo from '../Images/spice.mp4';
import Nav from '../NavCus/NavCus';
import Spice1Video from './sound.mp4';
import Footer from '../Footer/Footer';


function Home() {
    const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

    const menuItems = [
        {
            category: "Premium Spices",
            items: [
                { name: "Cinnamon", price: "RS 25.00/kg", description: "Sweet and aromatic Ceylon cinnamon", featured: true },
                { name: "Cardamom", price: "RS 45.00/kg", description: "Premium green cardamom pods" },
                { name: "Turmeric", price: "RS 18.00/kg", description: "Organic turmeric powder" },
                { name: "Pepper", price: "RS 22.00/kg", description: "Bold black pepper" },
                { name: "Clove", price: "RS 35.00/kg", description: "Aromatic whole cloves" },
                { name: "Red Chili", price: "RS 15.00/kg", description: "Spicy dried red chilies" }
            ]
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Chef",
            content: "The quality of spices from Christies Foods is exceptional. Their cinnamon has transformed our bakery's signature dishes.",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Restaurant Owner",
            content: "Consistent quality and amazing flavor profiles. Christies Foods has become our trusted spice supplier.",
            rating: 5,
           
        },
        {
            name: "Emma Williams",
            role: "Home Cook",
            content: "The freshness and aroma of their spices are unmatched. I can taste the difference in every dish I make.",
            rating: 4,
           
        }
    ];

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar key={index} className={index < rating ? 'star-filled' : 'star-empty'} />
        ));
    };

    return (
        <div className="home-container">
            <Nav />
            {/* Hero Section */}
            <section className="hero-section" id="section_1">
                <div className="hero-content">
                    <em className="small-text">welcome to Epic Green</em>
                    <h1>Taste Matters!</h1>
                    <p className="hero-subtitle">
                        Handpicked with love in Matale. Embrace Timeless Essences: Elevating Culinary Delights with Exquisite Flavours of Asia
                    </p>
                    <div className="hero-buttons">
                        <Link to="#section_2" className="btn custom-btn custom-border-btn smoothscroll">
                            Our Story
                        </Link>
                    </div>
                </div>
                <div className="hero-slides">
                    <video autoPlay muted loop className="hero-video">
                        <source src={SpiceVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section section-padding" id="section_2">
                <div className="section-overlay"></div>
                <div className="container">
                    <div className="row align-items-center">
                       <div className="col-lg-6 col-12">
              <div className="about-video-container" style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '15px', overflow: 'hidden' }}>
                <video 
                  ref={videoRef}
                  src={Spice1Video} 
                  autoPlay 
                  muted
                  loop 
                  playsInline
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                >
                  <source src={Spice1Video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button 
                  onClick={toggleMute}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    zIndex: 3,
                    fontSize: '16px'
                  }}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2, color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  <h4 className="mb-0">We Started Since 2009.</h4>
                  <h4 className="mb-0">Best Spice Farm in Matale.</h4>
                </div>
              </div>
            </div>
                        <div className="col-lg-5 col-12 mt-4 mt-lg-0 mx-auto">
                            <em className="text-white">Christies Foods</em>
                            <h2 className="text-white mb-3">Taste Matters!</h2>
                            <p className="text-white">
                                Our farm has been in Matale for as long as anyone can remember, and it has become a beloved institution among the locals.
                            </p>
                            <p className="text-white">
                                The farm is run by dedicated professionals committed to sustainable farming practices and producing the finest spices in Sri Lanka.
                            </p>
                            <Link to="#team" className="smoothscroll btn custom-btn custom-border-btn mt-3 mb-4">
                                Meet Our Team
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            {/* Showcase Section */}
            <section className="showcase-section section-padding section-bg" id="showcase">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12 col-12 text-center mb-4 pb-lg-2">
                            <em className="text-white">Premium Quality</em>
                            <h2 className="text-white">Our Products</h2>
                        </div>
                        <div className="col-lg-12 col-12">
                            <div className="showcase-grid">
                                <div className="showcase-item featured">
                                    <img src="./images/product4.jpg" alt="Premium spices" className="img-fluid" />
                                    <div className="showcase-overlay">
                                        <h3 className="text-white">Premium Cinnamon</h3>
                                        <p className="text-white">World's finest quality</p>
                                    </div>
                                </div>
                                <div className="showcase-item">
                                    <img src="./images/product2.jpg"  alt="Cardamom" className="img-fluid" />
                                    <div className="showcase-overlay">
                                        <h4 className="text-white">Black Pepper</h4>
                                    </div>
                                </div>
                                <div className="showcase-item">
                                    <img src="./images/product3.jpg" alt="Turmeric" className="img-fluid" />
                                    <div className="showcase-overlay">
                                        <h4 className="text-white">Turmeric</h4>
                                    </div>
                                </div>
                                <div className="showcase-item">
                                    <img src="./images/product1.jpg" alt="Pepper" className="img-fluid" />
                                    <div className="showcase-overlay">
                                        <h4 className="text-white">Chillie Powder</h4>
                                    </div>
                                </div>
                                <div className="showcase-item">
                                    <img src="./images/currymix.jpg" alt="Pepper" className="img-fluid" />
                                    <div className="showcase-overlay">
                                        <h4 className="text-white">Meat Curry Mix</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            <section className="menu-section section-padding" id="section_3">
                <div className="container">
                    <div className="row">
                        {menuItems.map((category, catIndex) => (
                            <div className="col-lg-6 col-12 mb-4 mb-lg-0" key={catIndex}>
                                <div className="menu-block-wrap">
                                    <div className="text-center mb-4 pb-lg-2">
                                        <em className="text-white">Premium Quality</em>
                                        <h4 className="text-white">{category.category}</h4>
                                    </div>
                                    {category.items.map((item, itemIndex) => (
                                        <div className={`menu-block ${itemIndex > 0 ? 'my-4' : ''}`} key={itemIndex}>
                                            <div className="d-flex">
                                                <h6>
                                                    {item.name}
                                                    {item.featured && <span className="badge ms-3">Recommend</span>}
                                                </h6>
                                                <span className="underline"></span>
                                                <strong className="ms-auto">{item.price}</strong>
                                            </div>
                                            <div className="border-top mt-2 pt-2">
                                                <small>{item.description}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="reviews-section section-padding section-bg" id="section_4">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12 col-12 text-center mb-4 pb-lg-2">
                            <em className="text-white">Reviews by Customers</em>
                            <h2 className="text-white">REVIEWS</h2>
                        </div>
                        <div className="timeline">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    className={`timeline-container timeline-container-${index % 2 === 0 ? 'left' : 'right'}`}
                                    key={index}
                                >
                                    <div className="timeline-content">
                                        <div className="reviews-block">
                                            <div className="reviews-block-image-wrap d-flex align-items-center">
                                                <div>
                                                    <h6 className="text-white mb-0">{testimonial.name}</h6>
                                                    <em className="text-white">{testimonial.role}</em>
                                                </div>
                                            </div>
                                            <div className="reviews-block-info">
                                                <p>{testimonial.content}</p>
                                                <div className="d-flex border-top border-secondary pt-3 mt-4">
                                                    <strong className="text-dark">{testimonial.rating}.0 <small className="ms-2">Rating</small></strong>
                                                    <div className="reviews-group ms-auto">
                                                        {renderStars(testimonial.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="gallery-section section-padding section-bg" id="gallery">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-12 col-12 text-center mb-4 pb-lg-2">
                            <em className="text-white">Our Farm</em>
                            <h2 className="text-white">Gallery</h2>
                        </div>
                        <div className="col-lg-12 col-12">
                            <div className="gallery-grid">
                                <div className="gallery-item large">
                                    <img src="./images/gallery2.jpg" alt="Cinnamon sticks" className="img-fluid" />
                                </div>
                                <div className="gallery-item">
                                    <img src="./images/gallery1.jpg" alt="Cardamom pods" className="img-fluid" />
                                </div>
                                <div className="gallery-item">
                                    <img src="./images/gallery5.jpg" alt="Turmeric powder" className="img-fluid" />
                                </div>
                                <div className="gallery-item">
                                    <img src="./images/gallery6.jpg" alt="Black pepper" className="img-fluid" />
                                </div>
                                <div className="gallery-item">
                                    <img src="./images/gallery7.jpg" alt="Clove buds" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default Home;
