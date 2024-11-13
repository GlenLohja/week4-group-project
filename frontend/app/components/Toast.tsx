import React, { useEffect } from "react";

// Define a type for the props
interface ToastProps {
    message: string;
    onClose: () => void;
  }

const Toast: React.FC<ToastProps>  = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Automatically close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg transition-opacity duration-500 ease-in-out opacity-100">
      {message}
    </div>
  );
};

export default Toast;