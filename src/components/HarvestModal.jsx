// src/components/HarvestModal.jsx
import React, { useState } from 'react';
import ModalBase from './ModalBase'; // Import the new base modal
import { PlusIcon, CheckIcon, XIcon as LocalXIcon } from './icons'; // Renamed XIcon to avoid conflict if ModalBase's XIcon was different internally

// The 'isOpen' prop will be passed from App.js (as isHarvestModalOpen)
function HarvestModal({ isOpen, batchId, batchLabel, onClose, onSubmitHarvest }) {
    const [harvestWeight, setHarvestWeight] = useState('');
    const [tempHarvests, setTempHarvests] = useState([]);

    const handleAddTemp = () => {
        const weight = parseFloat(harvestWeight);
        if (!isNaN(weight) && weight > 0) {
            setTempHarvests([...tempHarvests, weight]);
            setHarvestWeight('');
        } else {
            alert("Please enter a valid positive weight.");
        }
    };

    const handleSubmit = () => {
        if (tempHarvests.length > 0) {
            onSubmitHarvest(batchId, tempHarvests);
            // App.js's submitHarvest function calls closeHarvestModal,
            // so no need to call onClose() here directly if that's the case.
            // If App.js didn't close it, then you would call onClose() here.
        } else {
            alert("No harvest weights entered to submit.");
        }
    };

    const totalTempWeight = tempHarvests.reduce((a, b) => a + b, 0).toFixed(2);

    // Original styles for elements specific to HarvestModal content
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"; //
    const buttonBaseStyle = "flex justify-center items-center p-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"; // Combined base style for footer buttons
    const addButtonStyle = `${buttonBaseStyle} w-full border-transparent text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-500`; //
    const submitButtonStyle = `${buttonBaseStyle} w-full sm:w-auto border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`; //
    const cancelButtonStyle = `${buttonBaseStyle} w-full sm:w-auto border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-orange-500`; //


    // Define the footer content for ModalBase
    const modalFooter = (
        <>
            <button onClick={onClose} className={cancelButtonStyle}>
               <LocalXIcon className="mr-1 h-4 w-4" /> Cancel {/* Using LocalXIcon if needed */}
            </button>
            <button onClick={handleSubmit} className={submitButtonStyle} disabled={tempHarvests.length === 0}>
               <CheckIcon className="mr-1 h-4 w-4" /> Submit All Entries
            </button>
        </>
    );
    
    // ModalBase handles the isOpen check internally, so no need for an outer if(!isOpen) return null here.
    // The parent component (App.js) handles rendering this component conditionally.
    return (
        <ModalBase
            isOpen={isOpen} // Pass the isOpen prop from App.js
            onClose={onClose}
            title={`Log Harvest for ${batchLabel}`} // Construct the title
            footerContent={modalFooter} // Pass the defined footer buttons
        >
            {/* Children: Specific content for the Harvest Modal */}
            <div className="space-y-3">
                <input
                    type="number"
                    id="harvestWeight"
                    value={harvestWeight}
                    onChange={(e) => setHarvestWeight(e.target.value)}
                    placeholder="Weight (kg)"
                    className={`${inputStyle} mb-1`} // Reduced mb from mb-3 as space-y-3 on parent handles some spacing
                    step="0.01"
                    min="0"
                />

                <button onClick={handleAddTemp} className={`${addButtonStyle}`}>
                   <PlusIcon className="mr-1 h-4 w-4" /> Add Weight Entry
                </button>

                <div id="harvestList" className="text-gray-600 text-sm max-h-24 overflow-y-auto bg-gray-50 border border-gray-200 p-2 rounded">
                    {tempHarvests.length === 0 && <p className="text-gray-500 italic">No weights added yet for this entry.</p>}
                    {tempHarvests.map((w, i) => <div key={i} className="py-0.5">• {w.toFixed(2)} kg</div>)}
                    {tempHarvests.length > 0 && <strong className="block mt-2 text-gray-700">Total Added: {totalTempWeight} kg</strong>}
                </div>
            </div>
        </ModalBase>
    );
 }

 export default HarvestModal;