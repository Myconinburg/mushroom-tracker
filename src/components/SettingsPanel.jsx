// src/components/SettingsPanel.jsx
import React from 'react';

// Import required icons from your single icons file
// Adjust path if needed
import { XIcon } from './icons'; // Assuming icons.jsx is in ./icons/

function SettingsPanel({ isOpen, onClose }) {
    // Placeholder content for the settings panel
    return (
        <>
            {/* Overlay: Covers the screen behind the panel, click to close */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none' // Control visibility and clickability
                }`}
                onClick={onClose} // Close panel when overlay is clicked
                aria-hidden="true" // Hide from accessibility tree when closed
            ></div>

            {/* Side Panel Container */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full' // Slide in/out effect
                }`}
                role="dialog" // Semantically a dialog
                aria-modal="true" // It's a modal panel
                aria-labelledby="settings-panel-title" // Associate title with the panel
            >
                {/* Panel Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 id="settings-panel-title" className="text-lg font-semibold text-gray-900">
                        Settings
                    </h2>
                    <button
                        onClick={onClose} // Close button action
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                    >
                        <span className="sr-only">Close settings panel</span>
                        <XIcon className="h-6 w-6" /> {/* Use XIcon */}
                    </button>
                </div>

                {/* Panel Body */}
                <div className="p-4">
                    {/* Placeholder for actual settings content */}
                    <p className="text-gray-600">Settings options will go here.</p>

                    {/* Example Setting 1: Theme Selection */}
                    <div className="mt-4">
                        <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700">
                            Theme
                        </label>
                        <select
                            id="theme-select"
                            name="theme"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                            // Add onChange handler later if needed
                        >
                            <option>Light (Current)</option>
                            <option disabled>Dark (Coming Soon!)</option>
                        </select>
                    </div>

                    {/* Example Setting 2: Financial Year Start */}
                     <div className="mt-4">
                        <label htmlFor="fy-start" className="block text-sm font-medium text-gray-700">
                            Financial Year Start
                        </label>
                        <select
                            id="fy-start"
                            name="fy-start"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                             // Add value and onChange handler later if needed
                        >
                            <option value="6">July</option>
                            <option value="0">January</option>
                            <option value="3">April</option>
                        </select>
                     </div>

                     {/* Add more settings sections as needed */}
                </div>
            </div>
        </>
    );
}

export default SettingsPanel;
