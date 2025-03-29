import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Reusable Modal component with standardized structure
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {ReactNode} props.title - Title content for the modal header
 * @param {ReactNode} props.children - Content to display in the modal body
 * @param {ReactNode} props.footer - Content to display in the modal footer
 * @param {string} props.size - Size of the modal ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.showCloseButton - Whether to show the close button in the header
 * @param {string} props.closeButtonPosition - Position of close button ('inside', 'outside')
 * @returns {JSX.Element|null}
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeButtonPosition = 'inside',
}) => {
  if (!isOpen) return null;

  // Size classes for the modal width
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Determine header padding based on close button position
  const headerPaddingClass = closeButtonPosition === 'inside' ? 'pr-12' : '';

  // Handle modal overlay click - close only if clicking the backdrop
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-scale-in`}>
        {/* Modal Header */}
        {title && (
          <div className="flex justify-between items-start p-6 border-b border-secondary-200 dark:border-secondary-700">
            <h2 className={`text-xl md:text-2xl font-bold text-secondary-900 dark:text-white ${headerPaddingClass}`}>
              {typeof title === 'string' ? (
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  {title}
                </span>
              ) : (
                title
              )}
            </h2>
            
            {/* Close button (inside position) */}
            {showCloseButton && closeButtonPosition === 'inside' && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}
        
        {/* Close button (outside position) */}
        {showCloseButton && closeButtonPosition === 'outside' && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-300 transition-colors z-10"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        )}
        
        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Modal Footer - only render if provided */}
        {footer && (
          <div className="p-6 border-t border-secondary-200 dark:border-secondary-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;