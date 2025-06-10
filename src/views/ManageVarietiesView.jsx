// src/views/ManageVarietiesView.jsx
import React, { useState } from 'react';

// Import necessary icons from your single icons file
// Adjust path if needed
import { TrashIcon, PlusIcon, MushroomIcon } from '../components/icons';

// Removed placeholder functions and list - using props now

function ManageVarietiesView({ availableVarieties, onAddVariety, onDeleteVariety }) { // Destructure props here
    // State for the new variety name input
    const [newVarietyName, setNewVarietyName] = useState('');
    // State for the new variety abbreviation input
    const [newVarietyAbbr, setNewVarietyAbbr] = useState('');

    // Handle clicking the "Add" button
    const handleAddClick = () => {
        const trimmedName = newVarietyName.trim();
        const trimmedAbbr = newVarietyAbbr.trim().toUpperCase(); // Ensure abbreviation is uppercase

        // --- Input Validation ---
        if (trimmedName === '') {
            alert('Please enter a variety name.');
            return;
        }
        if (trimmedAbbr === '') {
             alert('Please enter an abbreviation.');
             return;
        }
        // Basic validation for 2 uppercase letters using regex
        if (!/^[A-Z]{2}$/.test(trimmedAbbr)) {
             alert('Abbreviation must be exactly 2 uppercase letters (A-Z).');
             return;
        }

        // Call the onAddVariety function passed via props (from App.js)
        // This function in App.js will handle checking if name/abbr already exist
        onAddVariety(trimmedName, trimmedAbbr);

        // Clear the input fields after successful addition
        setNewVarietyName('');
        setNewVarietyAbbr('');
    };

    // --- Tailwind Styles (keep as they are) ---
    const containerStyle = "p-6 bg-white rounded-lg shadow border border-gray-200";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const listStyle = "list-disc pl-5 space-y-1 text-gray-700";
    const listItemStyle = "flex justify-between items-center py-1";
    const buttonBase = "px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const addButton = `${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ml-2`; // Note: Add button style adjusted slightly below
    const deleteButton = `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500`;


    return (
        <div className={containerStyle}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MushroomIcon /> Manage Varieties
            </h2>

            {/* --- Add New Variety Section --- */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                 {/* Use grid layout for better alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    {/* Name Input */}
                    <div className="sm:col-span-2"> {/* Name takes more horizontal space */}
                        <label htmlFor="new-variety-name" className="block text-sm font-medium text-gray-700 mb-1">
                            New Variety Name
                        </label>
                        <input
                            type="text"
                            id="new-variety-name"
                            value={newVarietyName}
                            onChange={(e) => setNewVarietyName(e.target.value)}
                            placeholder="e.g., Pink Oyster"
                            className={inputStyle}
                            required // HTML5 validation: must be filled
                        />
                    </div>
                    {/* Abbreviation Input */}
                    <div>
                         <label htmlFor="new-variety-abbr" className="block text-sm font-medium text-gray-700 mb-1">
                            Abbr. (2 Caps)
                        </label>
                        <input
                            type="text"
                            id="new-variety-abbr"
                            value={newVarietyAbbr}
                            onChange={(e) => setNewVarietyAbbr(e.target.value)}
                            placeholder="e.g., PO"
                            className={`${inputStyle} uppercase`} // Auto-uppercase input visually
                            maxLength="2" // HTML5 validation: max 2 chars
                            pattern="[A-Z]{2}" // HTML5 validation: exactly 2 uppercase letters
                            title="Enter exactly 2 uppercase letters (A-Z)" // Tooltip for guidance
                            required // HTML5 validation: must be filled
                        />
                    </div>
                </div>
                 {/* Add Button - Placed below the inputs for clarity */}
                 <div className="mt-3 text-right">
                     <button
                        onClick={handleAddClick}
                        // Use a slightly modified button style for better stand-alone look
                        className={`${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 inline-flex items-center px-4 py-2`}
                     >
                         <PlusIcon className="h-4 w-4 mr-1" /> Add Variety
                    </button>
                 </div>
            </div>

            {/* --- Existing Varieties List --- */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Varieties</h3>
                {/* Check if the availableVarieties array (passed as prop) is empty */}
                {availableVarieties && availableVarieties.length === 0 ? (
                    <p className="text-gray-500 italic">No varieties defined yet.</p>
                ) : (
                    <ul className={listStyle}>
                        {/* Map over availableVarieties (array of objects) */}
                        {availableVarieties && availableVarieties.map((variety) => (
                            // Use variety.name for the key, as it should be unique
                            <li key={variety.name} className={listItemStyle}>
                                {/* Display both the name and the abbreviation */}
                                <span>{variety.name} <span className="text-xs text-gray-500">({variety.abbr})</span></span>
                                {/* Call onDeleteVariety (passed as prop) with the *entire variety object* */}
                                <button onClick={() => onDeleteVariety(variety)} className={deleteButton} title={`Delete ${variety.name}`}>
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default ManageVarietiesView;