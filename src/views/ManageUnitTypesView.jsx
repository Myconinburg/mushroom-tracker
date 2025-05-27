// src/views/ManageUnitTypesView.jsx
import React, { useState } from 'react';

// Import necessary icons
// Using ArchiveIcon as a placeholder, replace if you add a better icon for 'unit'
import { TrashIcon, PlusIcon, ArchiveIcon } from '../components/icons';

function ManageUnitTypesView({
    availableUnitTypes, // Prop from App.js: array of unit type name strings
    onAddUnitType,      // Prop from App.js: function to add a unit type
    onDeleteUnitType    // Prop from App.js: function to delete a unit type
}) {
    // State only for the input field value
    const [newUnitTypeName, setNewUnitTypeName] = useState('');

    // Handle clicking the "Add" button
    const handleAddClick = () => {
        const trimmedName = newUnitTypeName.trim();
        if (trimmedName === '') {
            alert('Please enter a unit type name (e.g., bag, jar).');
            return;
        }
        // Call the onAddUnitType function passed via props (from App.js)
        // This function in App.js will handle checking if the name already exists
        onAddUnitType(trimmedName);
        setNewUnitTypeName(''); // Clear input after adding
    };

    // --- Tailwind Styles ---
    const containerStyle = "p-6 bg-white rounded-lg shadow border border-gray-200";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const listStyle = "list-disc pl-5 space-y-1 text-gray-700";
    const listItemStyle = "flex justify-between items-center py-1 capitalize"; // Added capitalize
    const buttonBase = "px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const addButton = `${buttonBase} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ml-2 inline-flex items-center`;
    const deleteButton = `${buttonBase} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500`;


    return (
        <div className={containerStyle}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ArchiveIcon className="mr-2 h-5 w-5" /> Manage Unit Types {/* Using ArchiveIcon as placeholder */}
            </h2>

            {/* Add New Unit Type Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <label htmlFor="new-unit-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Unit Type
                </label>
                <div className="flex">
                    <input
                        type="text"
                        id="new-unit-type"
                        value={newUnitTypeName}
                        onChange={(e) => setNewUnitTypeName(e.target.value)}
                        placeholder="e.g., Tray, Bottle"
                        className={inputStyle}
                    />
                    <button onClick={handleAddClick} className={addButton}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>
            </div>

            {/* Existing Unit Types List */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Unit Types</h3>
                {/* Check if the availableUnitTypes array (prop) is empty */}
                {availableUnitTypes && availableUnitTypes.length === 0 ? (
                    <p className="text-gray-500 italic">No unit types defined yet.</p>
                ) : (
                    <ul className={listStyle}>
                        {/* Map over availableUnitTypes (prop) */}
                        {availableUnitTypes && availableUnitTypes.map((unitType) => (
                            <li key={unitType} className={listItemStyle}>
                                <span>{unitType}</span>
                                {/* Call onDeleteUnitType (prop) with the unit type name string */}
                                <button onClick={() => onDeleteUnitType(unitType)} className={deleteButton} title={`Delete ${unitType}`}>
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

export default ManageUnitTypesView;