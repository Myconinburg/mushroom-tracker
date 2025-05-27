// src/components/MovePartialToGrowRoomModal.jsx
import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase'; // Import the new base modal

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MovePartialToGrowRoomModal({ isOpen, onClose, parentBatch, onSubmit }) {
  const [quantityToMove, setQuantityToMove] = useState(1);
  const [newBatchColonisationDate, setNewBatchColonisationDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantityToMove(1);
      setNewBatchColonisationDate(getTodayDateString());
      setNotes('');
      setError('');
    }
  }, [isOpen, parentBatch]);

  // The parentBatch check and early return for invalid state is still good,
  // ModalBase will only render if isOpen is true.
  if (!isOpen || (!parentBatch && isOpen) || (parentBatch && typeof parentBatch.id === 'undefined' && isOpen)) {
    if (isOpen && (!parentBatch || typeof parentBatch.id === 'undefined')) {
        console.error("MovePartialToGrowRoomModal: parentBatch data is missing or invalid when modal is open.");
    }
    // ModalBase itself checks for isOpen, so we primarily need to ensure parentBatch is valid if open
    return null;
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (quantityToMove <= 0) {
      setError('Quantity to move must be greater than 0.');
      return;
    }
    if (typeof parentBatch.numBags === 'undefined' || quantityToMove > parentBatch.numBags) {
      setError(`Quantity to move cannot exceed available units (${parentBatch.numBags || '0'}).`);
      return;
    }
    if (!newBatchColonisationDate) {
      setError('Please select a colonisation date for the new batch.');
      return;
    }
    onSubmit({ quantity: quantityToMove, colonisationDate: newBatchColonisationDate, notes: notes });
  };

  // Define the footer content (action buttons)
  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        Cancel
      </button>
      <button
        type="submit" // This button will now submit the form defined in `children`
        form="move-partial-form" // Associate with the form via ID
        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Confirm & Move Units
      </button>
    </>
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Move Partial Batch"
      footerContent={modalFooter}
    >
      {/* Form and specific content for this modal */}
      <div className="mb-4 text-sm text-gray-600">
        <p>From: <span className="font-semibold text-gray-700">{parentBatch.batchLabel || parentBatch.id}</span></p>
        <p>Available Units: <span className="font-semibold text-gray-700">{parentBatch.numBags}</span></p>
      </div>

      <form onSubmit={handleFormSubmit} id="move-partial-form">
        <div className="mb-4">
          <label htmlFor="quantityToMove" className="block text-sm font-medium text-gray-700 mb-1">
            Units to move:
          </label>
          <input
            type="number"
            id="quantityToMove"
            value={quantityToMove}
            onChange={(e) => setQuantityToMove(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            min="1"
            max={parentBatch.numBags}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="newBatchColonisationDate" className="block text-sm font-medium text-gray-700 mb-1">
            Colonisation Date (for new batch):
          </label>
          <input
            type="date"
            id="newBatchColonisationDate"
            value={newBatchColonisationDate}
            onChange={(e) => setNewBatchColonisationDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional):
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="2"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}
        
        {/* The actual submit button is now in `modalFooter`.
          The form needs an ID that the external button can reference.
          Alternatively, the submit button could be part of these children,
          and you wouldn't use the `footerContent` prop for it.
          Using `footerContent` for common button placement is often cleaner.
        */}
      </form>
    </ModalBase>
  );
}

export default MovePartialToGrowRoomModal;