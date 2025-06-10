// src/components/ModalBase.jsx
import React from 'react';
import { XIcon } from './icons'; // Assuming XIcon is in './icons.jsx'

function ModalBase({ isOpen, onClose, title, children, footerContent }) {
    if (!isOpen) {
        return null;
    }

    // Prevent clicks inside the modal content from bubbling up further,
    // though with overlay click removed, this is less critical for closure,
    // but still good practice for general event management.
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        // Overlay: Full screen, semi-transparent background
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75"
            // onClick={onClose} // <-- THIS LINE IS REMOVED
        >
            {/* Modal Content Box: Centered, styled */}
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto overflow-hidden"
                onClick={handleContentClick} // Stop click from bubbling (good practice)
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header Section */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                    <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800">
                        {title}
                    </h3>
                    <button
                        onClick={onClose} // Close button action
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        aria-label="Close modal"
                    >
                        <XIcon className="h-6 w-6" /> {/* */}
                    </button>
                </div>

                {/* Content Section: Specific content passed as children */}
                <div className="p-4 sm:p-6 text-sm text-gray-700">
                    {children}
                </div>

                {/* Footer Section (Optional) */}
                {footerContent && (
                    <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-end gap-2">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModalBase;