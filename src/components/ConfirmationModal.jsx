// src/components/ConfirmationModal.jsx
import React from 'react';
import ModalBase from './ModalBase';
import { CheckIcon } from './icons';

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClassName = "bg-green-600 hover:bg-green-700 focus:ring-green-500"
}) {
  if (!isOpen) {
    return null;
  }

  const baseButtonStyles = "px-6 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckIcon className="h-10 w-10 text-green-600" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}

        <div className="flex justify-center gap-4">
          {/* THE CHANGE: Only show Cancel button if cancelText is provided */}
          {cancelText && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`${baseButtonStyles} ${confirmButtonClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

export default ConfirmationModal;
