// src/views/ManageSuppliersView.jsx
import React, { useState } from 'react';

// Import necessary icons from your single icons file
// Adjust path if needed
import { TrashIcon, PlusIcon, SupplierIcon } from '../components/icons';

// Placeholder function - replace with props from App.js later
const handleDeleteSupplier = (supplierName) => {
    console.log("Placeholder: Delete supplier", supplierName);
    alert(`Delete functionality for ${supplierName} not fully implemented yet.`);
};

// Placeholder function - replace with props from App.js later
const handleAddSupplier = (newSupplier) => {
    console.log("Placeholder: Add supplier", newSupplier);
    alert(`Add functionality for ${newSupplier} not fully implemented yet.`);
};

// Placeholder list - replace with props from App.js later
const placeholderSuppliers = [
    "Local Spores Co.", "MycoSupreme", "Fungi Perfecti", "Gourmet Mushrooms"
];


function ManageSuppliersView({
    // Props to be added later from App.js:
    // availableSuppliers = placeholderSuppliers,
    // onAddSupplier = handleAddSupplier,
    // onDeleteSupplier = handleDeleteSupplier
}) {
    // Use placeholder data for now until props are passed
    const availableSuppliers = placeholderSuppliers;
    const onAddSupplier = handleAddSupplier;
    const onDeleteSupplier = handleDeleteSupplier;

    const [newSupplierName, setNewSupplierName] = useState('');

    const handleAddClick = () => {
        if (newSupplierName.trim() === '') {
            alert('Please enter a supplier name.');
            return;
        }
         if (availableSuppliers.includes(newSupplierName.trim())) {
             alert(`"${newSupplierName.trim()}" already exists.`);
             return;
        }
        onAddSupplier(newSupplierName.trim());
        setNewSupplierName(''); // Clear input after adding
    };

    // Styles (consistent with other management views)
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
                <SupplierIcon /> Manage Spawn Suppliers
            </h2>

            {/* Add New Supplier Section */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <label htmlFor="new-supplier" className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Supplier
                </label>
                <div className="flex">
                    <input
                        type="text"
                        id="new-supplier"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        placeholder="e.g., FungiSource"
                        className={inputStyle}
                    />
                    <button onClick={handleAddClick} className={addButton}>
                        <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>
            </div>

            {/* Existing Suppliers List */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Existing Suppliers</h3>
                {availableSuppliers.length === 0 ? (
                    <p className="text-gray-500 italic">No suppliers defined yet.</p>
                ) : (
                    <ul className={listStyle}>
                        {availableSuppliers.map((supplier) => (
                            <li key={supplier} className={listItemStyle}>
                                <span>{supplier}</span>
                                <button onClick={() => onDeleteSupplier(supplier)} className={deleteButton} title={`Delete ${supplier}`}>
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

export default ManageSuppliersView;
