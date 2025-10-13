 import React, { useState } from 'react';
import './ContactUs.css';
import Footer from '../Footer/Footer';
import Nav from '../NavCus/NavCus';
import axios from 'axios'; // ✅ Added for backend connection

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // ✅ Updated: send data to backend (MongoDB)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('http://localhost:5000/contact', formData);

      if (response.data.success) {
        setSubmitMessage(response.data.message);
        setFormData({
          name: '',
          company: '',
          phone: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage('Failed to submit your message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitMessage('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <div className="contactus-page">
      <Nav />
      {/* Hero Section */}
      <section className="contactus-hero-section">
        <div className="contactus-hero-overlay">
          <div className="contactus-hero-content">
            <h1>Contact us</h1>
            <p>We're ready to provide the right solution according to your needs</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="contactus-main-content">
        <div className="contactus-content-container">
          <div className="contactus-contact-info">
            <h2>Get in touch</h2>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

            <div className="contactus-contact-details">
              <div className="contactus-contact-item">
                <div className="contactus-contact-icon">
                  <i className="icon-location"></i>
                </div>
                <div className="contactus-contact-text">
                  <h4>Epic Green Ecoystems Pvt Ltd.</h4>
                  <p>466,Dimbulgamuwa,<br />
                    Madawala Ulpotha, Matale,
                    Sri Lanka</p>
                </div>
              </div>

              <div className="contactus-contact-item">
                <div className="contactus-contact-icon">
                  <i className="icon-email"></i>
                </div>
                <div className="contactus-contact-text">
                  <h4>Email Us</h4>
                  <p>epicgreen@gmail.com<br />
                    hello@yourcompany.com</p>
                </div>
              </div>

              <div className="contactus-contact-item">
                <div className="contactus-contact-icon">
                  <i className="icon-phone"></i>
                </div>
                <div className="contactus-contact-text">
                  <h4>Call Us</h4>
                  <p>Phone: +94 66-313 6100<br />
                    Fax: +94 70-313 6113</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contactus-contact-form">
            <h2>Send us a message</h2>
            {submitMessage && (
              <div className="contactus-success-message">
                {submitMessage}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="contactus-form-row">
                <div className="contactus-form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="contactus-form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="contactus-form-row">
                <div className="contactus-form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your Phone"
                  />
                </div>
                <div className="contactus-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>

              <div className="contactus-form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Subject"
                  required
                />
              </div>

              <div className="contactus-form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message here..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="contactus-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contactus-map-section">
        <div className="contactus-map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.116731236711!2d80.6283942!3d7.6078914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae34d6d13fc725b%3A0xd42b48bc31e4af0!2sEpic%20Green%2C%20Madawala%20Ulpotha!5e0!3m2!1sen!2slk!4v1726905600000!5m2!1sen!2slk"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactUs;
