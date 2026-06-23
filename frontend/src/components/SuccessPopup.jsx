import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessPopup = ({ isOpen, onConfirm, onClose, title, message }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;


  const handleConfirm = (e) => {
    e.stopPropagation();
    if (onClose) onClose();
    if (onConfirm) navigate('/userpage');
  };

  return (
    <div 
  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl transform transition-all">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600">{message}</p>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={(e) => handleConfirm(e)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md transition-colors"
            style={{ backgroundColor: '#F08B00' }}
          >
            Amazing! Take me to my bookings!
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;