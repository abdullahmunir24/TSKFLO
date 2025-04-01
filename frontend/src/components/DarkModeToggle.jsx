import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle = ({ className }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 
        transition-colors text-secondary-600 dark:text-secondary-400 h-8 w-8 
        flex items-center justify-center ${className || ''}`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <FaSun className="h-4 w-4 text-warning-400" />
      ) : (
        <FaMoon className="h-4 w-4 text-purple-500" />
      )}
    </button>
  );
};

export default DarkModeToggle;