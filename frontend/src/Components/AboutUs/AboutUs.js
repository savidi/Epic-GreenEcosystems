import React from 'react';
import './AboutUs.css';
import teamMember1 from './savi2.jpg';
import teamMember2 from './Gemini_Generated_Image_p00nf7p00nf7p00n.png';
import teamMember3 from './nithya.jpg';
import teamMember4 from './Gemini_Generated_Image_amg3r5amg3r5amg3.png';
import teamMember5 from './patali.png';
import Nav from '../NavCus/NavCus';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Savindya Wickramasinghe",
      position: "Founder & Director",
      image: teamMember1
    },
    {
      id: 2,
      name: "Heshawa Bandara",
      position: "Head of Technology",
      image: teamMember2
    },
    {
      id: 3,
      name: "Nithya Waidyaratne",
      position: "Operations Manager",
      image: teamMember3
    },
    {
      id: 4,
      name: "Nadun Ranasinghe",
      position: "Supply Chain Specialist",
      image: teamMember4
    },
    {
      id: 5,
      name: "Patali Thennakoon",
      position: "Marketing Lead",
      image: teamMember5
    }
  ];

  const values = [
    "Transparency and trust in every spice transaction.",
    "Support local farmers with fair pricing.",
    "Promote sustainable cultivation practices.",
    "Deliver quality spices to global markets."
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <Nav />
      <section className="about-hero-section">
        <div className="about-hero-content">
          <h1>About Us</h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission-section">
        <div className="about-section-content">
          <div className="about-text-content">
            <h2>OUR MISSION</h2>
            <p>
              Our mission is to simplify and modernize the way spices are managed, traded,
              and distributed. We connect farmers, suppliers, and buyers into one platform.
            </p>
            <p>
              Through technology, we bring sustainability and profitability to the spice industry
              while preserving Sri Lanka’s heritage in spices.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-vision-section">
        <div className="about-vision-background">
          <div className="about-vision-overlay">
            <div className="about-section-content">
              <div className="about-text-content">
                <h2>OUR VISION</h2>
                <p>
                  To become the leading digital platform for spice management,
                  empowering Sri Lanka’s spices to shine globally.
                </p>
                <p>
                  We envision every spice journey being traceable, fair, and sustainable
                  from farmer to customer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values-section">
        <div className="about-section-content">
          <div className="about-text-content">
            <h2>OUR VALUES</h2>
            <ul className="about-values-list">
              {values.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team-section">
        <h2 className="about-team-heading">OUR TEAM</h2>
        <div className="about-team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="about-team-member">
              <div className="about-member-image">
                <img src={member.image} alt={member.name} />
                <div className="about-member-overlay">
                  <div className="about-member-info">
                    <h3>{member.name}</h3>
                    <p>{member.position}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <div className="about-cta-text">
            <h2>Join us in transforming Sri Lanka’s spice industry with smart solutions.</h2>
          </div>
          <div className="about-cta-arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;