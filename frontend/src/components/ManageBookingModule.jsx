import { useState } from 'react';
import { FaPlus, FaMinus } from "react-icons/fa";
import ConfirmationPopup from './ConfirmationPopup';
import SuccessPopup from './SuccessPopup';
import PaymentMethodPopup from './PaymentMethodPopup';

// Utility functions for quantity limits
const limitQty = (num) => {
  const MIN = 1;
  const MAX = 10;
  const parsed = parseInt(num);
  return Math.min(Math.max(parsed, MIN), MAX);
};

const incrementQty = (qty) => limitQty((parseFloat(qty) || 0) + 1);
const reduceQty = (qty) => limitQty((parseFloat(qty) || 0) - 1);

// Render function following ReserveButton pattern
export const renderManageBookingModule = ({
  event,
  eventDetails,      // Add: the event to reserve (when no booking)
  qty,
  onQtyChange,
  onUpdate,
  onCancel,
  onReserve,         // Add: reserve callback
  onReserveComplete,
  hasChanges,
  isUpdating,
  isReserving        // Add: reserve loading state
}) => {
  return (
    <ManageBookingModule
      event={event}
      eventDetails={eventDetails}
      qty={qty}
      onQtyChange={onQtyChange}
      onUpdate={onUpdate}
      onCancel={onCancel}
      onReserve={onReserve}
      onReserveComplete={onReserveComplete}
      hasChanges={hasChanges}
      isUpdating={isUpdating}
      isReserving={isReserving}
    />
  );
};

const ManageBookingModule = ({
  event,
  eventDetails,
  qty,
  onQtyChange,
  onUpdate,
  onCancel,
  onReserve,
  onReserveComplete,  // NEW: called after popup dismiss
  hasChanges,
  isUpdating,
  isReserving
}) => {
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [reservedData, setReservedData] = useState(null); // Store result until popup closes

  const handleAdd = () => onQtyChange(incrementQty(qty));
  const handleReduce = () => onQtyChange(reduceQty(qty));

  const handleUpdateClick = async () => {
    try {
      await onUpdate();
      setSuccessMessage('Event Updated Successfully');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  // STEP 1: Reserve button now opens the payment method popup, instead of reserving immediately
  const handleReserveClick = () => {
    setShowPaymentPopup(true);
  };

  // STEP 2: Called when user confirms their chosen payment method
  const handlePaymentConfirm = async (paymentMethod) => {
    try {
      const result = await onReserve(paymentMethod); // Pass method up to parent
      setReservedData(result);
      setShowPaymentPopup(false);
      setSuccessMessage('Event Reserved Successfully');
      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Reserve failed", error);
      setShowPaymentPopup(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    // Now tell parent to update state
    if (reservedData && onReserveComplete) {
      onReserveComplete(reservedData);
      setReservedData(null);
    }
  };

  return (
    <>
      {/* Reserve UI when no booking */}
      {!event && (
        <button
          className="rounded p-2 font-semibold text-black hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: '#F08B00' }}
          onClick={(e) => { e.stopPropagation(); handleReserveClick(); }}
          disabled={isReserving}
        >
          {isReserving ? 'Reserving...' : 'Reserve'}
        </button>
      )}

      {/* Manage booking UI when booking exists */}
      {event && (
        <>
          <div className="flex flex-row items-start gap-2 w-md border p-2" style={{ borderColor: '#272727' }}>
            <button onClick={(e) => { e.stopPropagation(); handleReduce(); }}>
              <FaMinus color="#F08B00" size="1rem" />
            </button>
            <p className="text-white break-words text-base">{qty ?? 1}</p>
            <button onClick={(e) => { e.stopPropagation(); handleAdd(); }}>
              <FaPlus color="#F08B00" size="1rem" />
            </button>
          </div>
          <div className="flex flex-col border p-2" style={{ borderColor: '#272727' }}>
            {hasChanges && (
              <div className="mt-2 flex-col gap-8">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpdateClick(); }}
                  disabled={isUpdating}
                  className="p-2 rounded font-semibold text-black hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#097c26' }}
                >
                  {isUpdating ? 'Updating...' : 'Update Reservation'}
                </button>
              </div>
            )}
            <div className="mt-2 flex-col gap-8">
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirmationPopup(true); }}
                className="p-2 rounded font-semibold text-black hover:opacity-80"
                style={{ backgroundColor: '#F08B00' }}
              >
                Cancel Reservation
              </button>
              <ConfirmationPopup
                isOpen={showConfirmationPopup}
                onClose={() => setShowConfirmationPopup(false)}
                onConfirm={() => {
                  onCancel();
                  setShowConfirmationPopup(false);
                }}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this reservation?"
              />
            </div>
          </div>
        </>
      )}

      {/* Payment method selection popup - shown before reservation is created */}
      <PaymentMethodPopup
        isOpen={showPaymentPopup}
        onClose={() => setShowPaymentPopup(false)}
        onConfirm={handlePaymentConfirm}
        isProcessing={isReserving}
      />

      {/* Single SuccessPopup outside conditionals - always mounted */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessClose}
        onConfirm={handleSuccessClose}
        title="Success"
        message={successMessage}
      />
    </>
  );
};

export default ManageBookingModule;