// src/components/HarvestModal.jsx
import React, { useState } from 'react';

// Import required icons from your single icons file
// Adjust path if needed
import { PlusIcon, CheckIcon, XIcon } from './icons'; // Assuming icons.jsx is in ./icons/

function HarvestModal({ batchId, batchLabel, onClose, onSubmitHarvest }) {
    const [harvestWeight, setHarvestWeight] = useState('');
    const [tempHarvests, setTempHarvests] = useState([]); // Store weights added in this session

    // Handler to add a weight entry to the temporary list
    const handleAddTemp = () => {
        const weight = parseFloat(harvestWeight);
        if (!isNaN(weight) && weight > 0) {
            setTempHarvests([...tempHarvests, weight]);
            setHarvestWeight(''); // Clear input after adding
        } else {
            alert("Please enter a valid positive weight.");
        }
    };

    // Handler to submit all temporarily added weights
    const handleSubmit = () => {
        if (tempHarvests.length > 0) {
            onSubmitHarvest(batchId, tempHarvests); // Pass the array of weights up
            onClose(); // Close modal after submission (handled in App.js)
        } else {
            alert("No harvest weights entered to submit.");
        }
    };

    // Calculate the total weight added in this modal session
    const totalTempWeight = tempHarvests.reduce((a, b) => a + b, 0).toFixed(2);

    // Styles consistent with the theme
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const buttonBaseStyle = "w-full flex justify-center items-center p-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
    const primaryButtonStyle = `${buttonBaseStyle} border-transparent text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-500`; // Yellow for adding
    const successButtonStyle = `${buttonBaseStyle} border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`; // Green for submitting
    const secondaryButtonStyle = `${buttonBaseStyle} border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-orange-500`; // Standard cancel

    return (
        // Modal Overlay - fixed position, covers screen, slight transparency
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            {/* Modal Content Box */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Log Harvest for <span className="text-orange-600">{batchLabel}</span>
                </h2>

                {/* Input for single harvest weight */}
                 <input
                    type="number"
                    id="harvestWeight"
                    value={harvestWeight}
                    onChange={(e) => setHarvestWeight(e.target.value)}
                    placeholder="Weight (kg)"
                    className={`${inputStyle} mb-3`}
                    step="0.01" // Allow decimal input
                    min="0" // Prevent negative input
                />

                {/* List of temporarily added weights for this session */}
                <div id="harvestList" className="mb-3 text-gray-600 text-sm max-h-24 overflow-y-auto bg-gray-50 border border-gray-200 p-2 rounded">
                    {tempHarvests.length === 0 && <p className="text-gray-500 italic">No weights added yet for this entry.</p>}
                    {tempHarvests.map((w, i) => <div key={i}>• {w} kg</div>)}
                    {tempHarvests.length > 0 && <strong className="block mt-2 text-gray-700">Total Added: {totalTempWeight} kg</strong>}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    <button onClick={handleAddTemp} className={primaryButtonStyle}>
                       <PlusIcon /> Add Weight Entry
                    </button>
                     <button onClick={handleSubmit} className={successButtonStyle} disabled={tempHarvests.length === 0}>
                       <CheckIcon /> Submit All Added Entries
                    </button>
                    <button onClick={onClose} className={secondaryButtonStyle}>
                       <XIcon /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
 }

 export default HarvestModal;
