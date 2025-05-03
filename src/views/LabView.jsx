// src/views/LabView.jsx
import React, { useState, useEffect } from 'react';

// Import helper functions
// Adjust the path based on your file structure (e.g., ../utils/helpers)
import { getAbbreviation, formatDate } from '../utils/helpers';

// Import necessary icons from your single icons file
// Adjust the path based on your file structure (e.g., ../components/icons)
import { LabIcon } from '../components/icons';

function LabView({ onAddBatch }) {
  // State for form inputs
  const [variety, setVariety] = useState('Blue Oyster'); // Default value
  const [inoculationDate, setInoculationDate] = useState(formatDate(new Date())); // Default to today
  const [numUnits, setNumUnits] = useState('');
  const [unitType, setUnitType] = useState('bag'); // Default value
  const [unitWeight, setUnitWeight] = useState('');
  const [substrateRecipe, setSubstrateRecipe] = useState('');
  const [spawnSupplier, setSpawnSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [batchLabel, setBatchLabel] = useState(''); // Auto-generated label

  // Effect to update batch label automatically when variety or date changes
  useEffect(() => {
      // Only generate label if variety and date are selected
      if (!variety || !inoculationDate) {
        setBatchLabel(""); // Clear label if inputs are missing
        return;
      }
      try {
          // Ensure date is parsed correctly, even if user types manually
          const date = new Date(inoculationDate + 'T00:00:00'); // Use T00:00:00 to avoid timezone shifts
          if (isNaN(date.getTime())) { // Check if the parsed date is valid
              setBatchLabel("Invalid Date"); // Indicate error in label
              return;
          }
          const abbrev = getAbbreviation(variety); // Use imported helper
          // Format: ABDD/MM/YY
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
          const year = String(date.getFullYear()).slice(-2);
          const label = `${abbrev}${day}/${month}/${year}`;
          setBatchLabel(label);
      } catch (e) {
          console.error("Error formatting date for batch label:", e);
          setBatchLabel("Error"); // Indicate error in label
      }
  }, [variety, inoculationDate]); // Dependencies: run effect when these change

  // Handle form submission
  const handleSubmit = (event) => {
      event.preventDefault(); // Prevent default form submission behavior
      const units = parseInt(numUnits);
      const weight = parseFloat(unitWeight);

      // --- Input Validation ---
      if (!variety || !inoculationDate || !units || units <= 0 || !batchLabel || batchLabel === "Error" || batchLabel === "Invalid Date" || !unitType || !unitWeight || weight <= 0 || !substrateRecipe || !spawnSupplier) {
        alert("Please complete all required fields correctly (Variety, Date, Number of Units > 0, Unit Type, Unit Weight > 0, Substrate, Spawn Supplier). Ensure date is valid.");
        return; // Stop submission if validation fails
      }

      // --- Create New Batch Object ---
      const newBatch = {
        batchLabel, // Auto-generated
        variety,
        inoculationDate,
        numBags: units, // Use the state variable name
        unitType,
        unitWeight: weight, // Use the parsed weight
        substrateRecipe,
        spawnSupplier,
        contaminatedBags: 0, // Default value
        harvests: [], // Default value
        notes,
        stage: "incubation", // Initial stage
        colonisationCompleteDate: null, // Default value
        growRoomEntryDate: null, // Default value
        retirementDate: null // Default value
      };

      // Call the function passed from App.js to add the batch and handle navigation
      onAddBatch(newBatch);
      alert("✅ Batch created and moved to Incubation Room!"); // User feedback

      // --- Clear Form Fields ---
        setVariety('Blue Oyster');
        setInoculationDate(formatDate(new Date()));
        setNumUnits('');
        setUnitType('bag');
        setUnitWeight('');
        setSubstrateRecipe('');
        setSpawnSupplier('');
        setNotes('');
        // Batch label will auto-update via useEffect
  };

  // --- Options for Dropdowns ---
  // TODO: Later, these will come from state managed in App.js
  const varietyOptions = [
    "Blue Oyster", "White Oyster", "Grey Oyster", "Yellow Oyster",
    "Black Pearl", "King Oyster", "Lions Mane", "Shiitake",
    "Piopinno", "Maitake", "Reishi", "Turkey Tail"
  ];
  const unitTypeOptions = ["bag", "block", "bucket", "jar", "other"];

  // --- Tailwind Styles ---
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputBaseStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";
  const inputStyle = `${inputBaseStyle} text-gray-900`;
  const selectStyle = `${inputBaseStyle} text-gray-900`;
  const readOnlyInputStyle = `${inputBaseStyle} bg-gray-100 text-gray-500 cursor-not-allowed`;
  const buttonStyle = "w-full mt-6 p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out text-lg";

  return (
    // Centered container for the form
    <div className="flex justify-center py-8 px-4">
      {/* Form card with styling */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-xl">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 text-center flex items-center justify-center">
          <LabIcon /> New Batch {/* Use imported icon */}
        </h2>
        {/* Form with vertical spacing between fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Each input field gets its own div */}
            <div>
                <label htmlFor="variety" className={labelStyle}>Variety</label>
                <select id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} className={selectStyle} required>
                    {varietyOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="inoculationDate" className={labelStyle}>Inoculation Date</label>
                <input type="date" id="inoculationDate" value={inoculationDate} onChange={(e) => setInoculationDate(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }} required/>
            </div>
             <div>
                <label htmlFor="numUnits" className={labelStyle}>Number of Units</label>
                <input type="number" id="numUnits" min="1" value={numUnits} onChange={(e) => setNumUnits(e.target.value)} placeholder="e.g., 10" className={inputStyle} required/>
            </div>
            <div>
                <label htmlFor="unitType" className={labelStyle}>Unit Type</label>
                <select id="unitType" value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectStyle} required>
                     {unitTypeOptions.map(option => <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="unitWeight" className={labelStyle}>Unit Weight (kg)</label>
                <input type="number" id="unitWeight" min="0.1" step="0.1" value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)} placeholder="e.g., 2.5" className={inputStyle} required/>
            </div>
            <div>
                <label htmlFor="substrateRecipe" className={labelStyle}>Substrate Recipe</label>
                <input type="text" id="substrateRecipe" value={substrateRecipe} onChange={(e) => setSubstrateRecipe(e.target.value)} placeholder="e.g., Masters Mix" className={inputStyle} required/>
            </div>
            <div>
                <label htmlFor="spawnSupplier" className={labelStyle}>Spawn Supplier</label>
                <input type="text" id="spawnSupplier" value={spawnSupplier} onChange={(e) => setSpawnSupplier(e.target.value)} placeholder="e.g., Local Spores Co." className={inputStyle} required/>
            </div>
            <div>
                <label htmlFor="notes" className={labelStyle}>Notes (optional)</label>
                <textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific details..." className={inputStyle}></textarea>
            </div>
            <div>
                <label htmlFor="batchLabel" className={labelStyle}>Batch Label (Auto-generated)</label>
                <input type="text" id="batchLabel" value={batchLabel} readOnly className={readOnlyInputStyle}/>
            </div>
          {/* Submit Button */}
          <div>
            <button type="submit" className={buttonStyle}>
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LabView; // Export the component
