// HomeNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTasks, FaBars, FaTimes } from "react-icons/fa";
import DarkModeToggle from "./DarkModeToggle";

const HomeNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Handle navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/90 dark:bg-secondary-900/90 backdrop-blur-lg shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className={`flex items-center gap-2 text-lg font-bold ${isScrolled ? 'text-primary-600 dark:text-white' : 'text-white'} hover:text-primary-200 transition-colors duration-300`}
            >
              <FaTasks className="h-6 w-6 animate-bounce-light" />
              <span className={`text-xl font-bold ${isScrolled ? 'text-primary-600 dark:text-white' : 'text-white'}`}>TSKFLO</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-3">
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                  isActivePath("/")
                    ? isScrolled ? "bg-primary-100 dark:bg-white/20 text-primary-600 dark:text-white" : "bg-white/20 text-white"
                    : isScrolled ? "text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10" : "text-white hover:bg-white/10"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                  isActivePath("/about")
                    ? isScrolled ? "bg-primary-100 dark:bg-white/20 text-primary-600 dark:text-white" : "bg-white/20 text-white"
                    : isScrolled ? "text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10" : "text-white hover:bg-white/10"
                }`}
              >
                About
              </Link>
            </nav>
            
            <div className="flex items-center gap-3 ml-3">
              {/* Dark mode toggle - now using our centralized component */}
              <DarkModeToggle className={isScrolled ? '' : 'text-white'} />
              
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-white text-primary-700 hover:bg-primary-50 rounded-lg font-medium shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            {/* Dark mode toggle (mobile) - now using our centralized component */}
            <DarkModeToggle className={isScrolled ? '' : 'text-white'} />
            
            <button
              type="button"
              className={`p-2 rounded-md ${isScrolled ? 'text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10' : 'text-white hover:bg-white/10'} transition-colors`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-60' : 'max-h-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 glass-morphism mx-4 mb-3 rounded-lg">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath("/")
                ? isScrolled ? "bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-200" : "bg-primary-500/10 text-primary-200"
                : isScrolled ? "text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActivePath("/about")
                ? isScrolled ? "bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-200" : "bg-primary-500/10 text-primary-200"
                : isScrolled ? "text-primary-600 dark:text-white hover:bg-primary-50 dark:hover:bg-white/10" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/login"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? "bg-primary-100 dark:bg-white/10 text-primary-600 dark:text-white hover:bg-primary-200 dark:hover:bg-white/20" : "bg-white/10 text-white hover:bg-white/20"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeNavBar;
