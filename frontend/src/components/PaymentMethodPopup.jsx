import React, { useState } from 'react';

const PaymentMethodPopup = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl transform transition-all">
        <p className="text-sm font-medium text-gray-400">Step 2 of 2</p>
        <h3 className="text-xl font-bold text-gray-900">Select Payment Method</h3>
        <p className="mt-2 text-gray-600">Choose how you'd like to pay for this booking.</p>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={() => setSelectedMethod('card')}
            />
            <span className="text-gray-800 font-medium">Credit / Debit Card</span>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={selectedMethod === 'paypal'}
              onChange={() => setSelectedMethod('paypal')}
            />
            <span className="text-gray-800 font-medium">PayPal</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedMethod)}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPopup;