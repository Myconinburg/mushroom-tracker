// src/views/ManageVarietiesView.jsx
import React, { useState } from 'react';

// Import necessary icons from your single icons file
// Adjust path if needed
import { TrashIcon, PlusIcon, MushroomIcon } from '../components/icons';

// Placeholder function - replace with props from App.js later
const handleDeleteVariety = (varietyName) => {
    console.log("Placeholder: Delete variety", varietyName);
    alert(`Delete functionality for ${varietyName} not fully implemented yet.`);
};

// Placeholder function - replace with props from App.js later
const handleAddVariety = (newVariety) => {
    console.log("Placeholder: Add variety", newVariety);
    alert(`Add functionality for ${newVariety} not fully implemented yet.`);
};

// Placeholder list - replace with props from App.js later
const placeholderVarieties = [
    "Blue Oyster", "White Oyster", "King Oyster", "Lions Mane", "Shiitake"
];


function ManageVarietiesView({
    // Props to be added later from App.js:
    // availableVarieties = placeholderVarieties, // Default to placeholder for now
    // onAddVariety = handleAddVariety,           // Default to placeholder for now
    // onDeleteVariety = handleDeleteVariety      // Default to placeholder for now
}) {
    // Use placeholder data for now until props are passed
    const availableVarieties = placeholderVarieties;
    const onAddVariety = handleAddVariety;
    const onDeleteVariety = handleDeleteVariety;

    const [newVarietyName, setNewVarietyName] = useState('');

    const handleAddClick = () => {
        if (newVarietyName.trim() === '') {
            alert('Please enter a variety name.');
            return;
        }
        if (availableVarieties.includes(newVarietyName.trim())) {
             alert(`${newVarietyName.trim()} already exists.`);
             return;
        }
        onAddVariety(newVarietyName.trim());
        setNewVarietyName(''); // Clear input after adding
    };

    // Styles
    const containerStyle = "p-6 bg-white rounded-lg shadow border border-gray-200";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const listStyle = "list-disc pl-5 space-y-1 text-gray-700";
    const listItemStyle = "flex justify-between items-center py-1";
    const buttonBase = "px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const addButton = `${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ml-2`;
    const deleteButton = `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500`;


    return (
        <div className={containerStyle}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MushroomIcon /> Manage Varieties
            </h2>

            {/* Add New Variety Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <label htmlFor="new-variety" className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Variety
                </label>
                <div className="flex">
                    <input
                        type="text"
                        id="new-variety"
                        value={newVarietyName}
                        onChange={(e) => setNewVarietyName(e.target.value)}
                        placeholder="e.g., Pink Oyster"
                        className={inputStyle}
                    />
                    <button onClick={handleAddClick} className={addButton}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>
            </div>

            {/* Existing Varieties List */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Varieties</h3>
                {availableVarieties.length === 0 ? (
                    <p className="text-gray-500 italic">No varieties defined yet.</p>
                ) : (
                    <ul className={listStyle}>
                        {availableVarieties.map((variety) => (
                            <li key={variety} className={listItemStyle}>
                                <span>{variety}</span>
                                <button onClick={() => onDeleteVariety(variety)} className={deleteButton} title={`Delete ${variety}`}>
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
