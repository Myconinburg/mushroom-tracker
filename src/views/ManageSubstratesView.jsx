// src/views/ManageSubstratesView.jsx
import React, { useState } from 'react';

// Import necessary icons
import { TrashIcon, PlusIcon, RecipeIcon } from '../components/icons'; // Assuming path is correct

// Remove placeholder functions and list - using props now

function ManageSubstratesView({
    availableSubstrates, // Prop from App.js: array of substrate name strings
    onAddSubstrate,      // Prop from App.js: function to add a substrate
    onDeleteSubstrate    // Prop from App.js: function to delete a substrate
}) {
    // State only for the input field value
    const [newSubstrateName, setNewSubstrateName] = useState('');

    // Handle clicking the "Add" button
    const handleAddClick = () => {
        const trimmedName = newSubstrateName.trim();
        if (trimmedName === '') {
            alert('Please enter a substrate recipe name.');
            return;
        }
        // Call the onAddSubstrate function passed via props (from App.js)
        // This function in App.js will handle checking if the name already exists
        onAddSubstrate(trimmedName);
        setNewSubstrateName(''); // Clear input after adding
    };

    // --- Tailwind Styles ---
    const containerStyle = "p-6 bg-white rounded-lg shadow border border-gray-200";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const listStyle = "list-disc pl-5 space-y-1 text-gray-700";
    const listItemStyle = "flex justify-between items-center py-1";
    const buttonBase = "px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const addButton = `${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ml-2 inline-flex items-center`; // Added flex items-center
    const deleteButton = `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500`;


    return (
        <div className={containerStyle}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <RecipeIcon /> Manage Substrate Recipes
            </h2>

            {/* Add New Substrate Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <label htmlFor="new-substrate" className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Substrate Recipe
                </label>
                <div className="flex">
                    <input
                        type="text"
                        id="new-substrate"
                        value={newSubstrateName}
                        onChange={(e) => setNewSubstrateName(e.target.value)}
                        placeholder="e.g., Coco Coir/Vermiculite"
                        className={inputStyle}
                    />
                    <button onClick={handleAddClick} className={addButton}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>
            </div>

            {/* Existing Substrates List */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Recipes</h3>
                {/* Check if the availableSubstrates array (prop) is empty */}
                {availableSubstrates && availableSubstrates.length === 0 ? (
                    <p className="text-gray-500 italic">No substrate recipes defined yet.</p>
                ) : (
                    <ul className={listStyle}>
                        {/* Map over availableSubstrates (prop) */}
                        {availableSubstrates && availableSubstrates.map((substrate) => (
                            <li key={substrate} className={listItemStyle}>
                                <span>{substrate}</span>
                                {/* Call onDeleteSubstrate (prop) with the substrate name string */}
                                <button onClick={() => onDeleteSubstrate(substrate)} className={deleteButton} title={`Delete ${substrate}`}>
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

export default ManageSubstratesView;