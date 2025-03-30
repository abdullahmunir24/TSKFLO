import { toast } from 'react-toastify';

// Default toast configuration
const defaultConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Success notification with standard styling
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...defaultConfig,
    autoClose: 3000, // shorter duration for success messages
    ...options,
  });
};

// Error notification with standard styling
export const showErrorToast = (message, options = {}) => {
  // Handle error objects or strings
  const errorMessage = typeof message === 'object' && message?.data?.message 
    ? message.data.message 
    : (message?.message || message || 'An unexpected error occurred');

  return toast.error(errorMessage, {
    ...defaultConfig,
    autoClose: 5000, // longer duration for error messages
    ...options,
  });
};

// Info notification with standard styling
export const showInfoToast = (message, options = {}) => {
  return toast.info(message, {
    ...defaultConfig,
    ...options,
  });
};

// Warning notification with standard styling
export const showWarningToast = (message, options = {}) => {
  return toast.warning(message, {
    ...defaultConfig,
    ...options,
  });
};

// Custom toast with JSX content
export const showCustomToast = (content, type = 'default', options = {}) => {
  return toast[type](content, {
    ...defaultConfig,
    ...options,
  });
};

// Promise-based toast for async operations
export const showPromiseToast = (promise, messages = {}, options = {}) => {
  const defaultMessages = {
    pending: 'Operation in progress...',
    success: 'Operation completed successfully!',
    error: 'Operation failed'
  };

  return toast.promise(
    promise,
    {
      pending: messages.pending || defaultMessages.pending,
      success: messages.success || defaultMessages.success,
      error: {
        render({ data }) {
          const errorMessage = data?.data?.message || data?.message || defaultMessages.error;
          return errorMessage;
        }
      }
    },
    {
      ...defaultConfig,
      ...options,
    }
  );
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Create a toast with a custom ID for updating or removing later
export const showToastWithId = (message, type = 'default', id, options = {}) => {
  return toast[type](message, {
    ...defaultConfig,
    toastId: id,
    ...options,
  });
};

// Update an existing toast by ID
export const updateToast = (id, message, type = 'default', options = {}) => {
  if (toast.isActive(id)) {
    return toast.update(id, {
      render: message,
      type,
      ...options,
    });
  }
  return showToastWithId(message, type, id, options);
}; 