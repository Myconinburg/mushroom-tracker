// src/views/LabView.jsx
import React, { useState, useEffect } from 'react';
import { formatDate, getAbbreviation } from '../utils/helpers'; // Assuming getAbbreviation is still needed
import { LabIcon } from '../components/icons';

function LabView({ onAddBatch, availableVarieties = [] }) { // Added availableVarieties prop
  // State for form inputs
  // Initialize varietyId with the ID of the first available variety, or empty string
  const [varietyId, setVarietyId] = useState(availableVarieties.length > 0 ? availableVarieties[0].id : '');
  const [inoculationDate, setInoculationDate] = useState(formatDate(new Date()));
  const [numUnits, setNumUnits] = useState('');
  const [unitType, setUnitType] = useState('bag');
  const [unitWeight, setUnitWeight] = useState('');
  const [substrateRecipe, setSubstrateRecipe] = useState('');
  const [spawnSupplier, setSpawnSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [batchLabel, setBatchLabel] = useState('');

  // Effect to update batch label
  useEffect(() => {
    const selectedVarietyObj = availableVarieties.find(v => v.id === parseInt(varietyId));
    const varietyNameForLabel = selectedVarietyObj ? selectedVarietyObj.name : 'Unknown';

    if (!varietyNameForLabel || !inoculationDate) {
      setBatchLabel("");
      return;
    }
    try {
      const date = new Date(inoculationDate + 'T00:00:00');
      if (isNaN(date.getTime())) {
        setBatchLabel("Invalid Date");
        return;
      }
      const abbrev = getAbbreviation(varietyNameForLabel);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const label = `${abbrev}${day}/${month}/${year}`;
      setBatchLabel(label);
    } catch (e) {
      console.error("Error formatting date for batch label:", e);
      setBatchLabel("Error");
    }
  }, [varietyId, inoculationDate, availableVarieties]);

  // Set initial varietyId when availableVarieties loads/changes and varietyId is not yet set or invalid
  useEffect(() => {
    if (availableVarieties.length > 0 && (!varietyId || !availableVarieties.find(v => v.id === parseInt(varietyId)))) {
        setVarietyId(availableVarieties[0].id.toString()); // Ensure it's a string for the select value
    }
  }, [availableVarieties, varietyId]);


  const handleSubmit = (event) => {
    event.preventDefault();
    const units = parseInt(numUnits);
    const weight = parseFloat(unitWeight);
    const parsedVarietyId = parseInt(varietyId);

    if (!parsedVarietyId || !inoculationDate || !units || units <= 0 || !batchLabel || batchLabel === "Error" || batchLabel === "Invalid Date" || !unitType || !unitWeight || weight <= 0 || !substrateRecipe || !spawnSupplier) {
      alert("Please complete all required fields correctly (Variety, Date, Number of Units > 0, Unit Type, Unit Weight > 0, Substrate, Spawn Supplier). Ensure date is valid.");
      return;
    }

    const selectedVarietyObj = availableVarieties.find(v => v.id === parsedVarietyId);

    const newBatch = {
      batchLabel,
      varietyId: parsedVarietyId, // Send the ID
      // Include variety_name if your backend also wants to store/show it directly on the batch, otherwise it's looked up via FK
      // varietyName: selectedVarietyObj ? selectedVarietyObj.name : 'Unknown', // Optional: if backend wants name too
      inoculationDate,
      numBags: units,
      unitType,
      unitWeight: weight,
      substrateRecipe,
      spawnSupplier,
      contaminatedBags: 0,
      harvests: [],
      notes,
      stage: "incubation",
      colonisationCompleteDate: null,
      growRoomEntryDate: null,
      retirementDate: null
    };
    console.log('LabView newBatch being sent to onAddBatch:', newBatch);
    onAddBatch(newBatch); // This will go to App.js, then to api.js which converts to snake_case

    // Clear form
    if (availableVarieties.length > 0) setVarietyId(availableVarieties[0].id.toString()); else setVarietyId('');
    setInoculationDate(formatDate(new Date()));
    setNumUnits('');
    setUnitType('bag');
    setUnitWeight('');
    setSubstrateRecipe('');
    setSpawnSupplier('');
    setNotes('');
  };

  const unitTypeOptions = ["bag", "block", "bucket", "jar", "other"];
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputBaseStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";
  const inputStyle = `${inputBaseStyle} text-gray-900`;
  const selectStyle = `${inputBaseStyle} text-gray-900`;
  const readOnlyInputStyle = `${inputBaseStyle} bg-gray-100 text-gray-500 cursor-not-allowed`;
  const buttonStyle = "w-full mt-6 p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out text-lg";

  return (
    <div className="flex justify-center py-8 px-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-xl">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 text-center flex items-center justify-center">
          <LabIcon /> New Batch
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="variety" className={labelStyle}>Variety</label>
            <select
                id="variety"
                value={varietyId} // Value is now the ID
                onChange={(e) => setVarietyId(e.target.value)}
                className={selectStyle}
                required
            >
              <option value="" disabled>Select a variety</option>
              {availableVarieties.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option> // Use v.id for value, v.name for display
              ))}
            </select>
          </div>
          {/* ... rest of your form inputs ... */}
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

export default LabView;
