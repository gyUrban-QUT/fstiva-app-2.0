import React from 'react';

export const renderButton = (submittingId, event, isBooked, handleReserve) => {
    
    if (isBooked) {
                return (
                    <button
                            className="rounded p-2 font-semibold text-black hover:opacity-80 disabled:opacity-50"
                            style={{ backgroundColor: '#927957' }}
                            disabled
                        > Reserved
                        </button>
                );
            } else {
                return (
                    <button
                        className="rounded p-2 font-semibold text-black hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: '#F08B00' }}
                        onClick={(e) => {e.stopPropagation();
                                        handleReserve(event);
                        
                        }}
                    disabled={submittingId === event._id}
                  >
                    {submittingId === event._id ? 'Reserving...' : 'Reserve'}
                    </button>
                    );
                    }
            };
