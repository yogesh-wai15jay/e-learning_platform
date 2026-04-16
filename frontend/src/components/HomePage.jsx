import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Import your local course images
// Place these images inside frontend/src/assets/ folder
// Update the file names to match your actual image names
import aiCourseImg from '../assets/ai-course.jpeg';
import serverCourseImg from '../assets/server-course.webp';
import leaveCourseImg from '../assets/leave-course.jfif';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* Hero Content - Matching the screenshot text */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto font-hero">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-pink-500">Learn with DBP –</span> where business meets excellence.
          </h1>
          <p className="text-lg md:text-xl mb-6 font-medium">
            Empower your career, one module at a time !!
          </p>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              Featured Courses
            </h2>
            <p className="text-gray-600 text-lg">
              Start your learning journey with our expert-led courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 - Secure & Responsible AI Usage */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
              <img 
                src={aiCourseImg} 
                alt="Secure & Responsible AI Usage" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Secure & Responsible AI Usage</h3>
                <p className="text-gray-600 mb-4">Learn how to use AI tools securely, protect sensitive data, and adopt a Zero-Trust mindset.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">⏱️ 60 min</span>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 - Server Policies */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
              <img 
                src={serverCourseImg} 
                alt="Server Policies" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Server Policies</h3>
                <p className="text-gray-600 mb-4">Master server configuration, security policies, and best practices for server management.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">⏱️ 40 min</span>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 - Leave Policy */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
              <img 
                src={leaveCourseImg} 
                alt="Leave Policy" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Leave Policy</h3>
                <p className="text-gray-600 mb-4">Understand and comply with our company's leave policies and procedures.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">⏱️ 30 min</span>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 Digital Business People. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;