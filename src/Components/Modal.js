import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button'; 

const Modal = ({ message, onClose }) => {
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    navigate('/upgrade'); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
        <p className="mb-4 text-black">{message}</p>
        <div className="flex items-center justify-center space-x-4">
          <Button onClick={onClose} className="bg-gray-500 text-white">Close</Button>
          <Button onClick={handleCheckoutRedirect} className="bg-blue-500 text-white">Go to Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
