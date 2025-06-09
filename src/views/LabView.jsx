// src/views/LabView.jsx
import React, { useState, useEffect } from 'react';

// Import helper functions
import { getAbbreviation, formatDate } from '../utils/helpers';

// Import necessary icons
import { LabIcon } from '../components/icons';

// Receive ALL managed lists as props
function LabView({
    availableVarieties,
    availableSubstrates,
    availableSuppliers,
    availableUnitTypes, // <-- Receive unit types
    onAddBatch
}) {

    // --- State for Form Inputs ---
    const [variety, setVariety] = useState(availableVarieties?.[0]?.name || '');
    const [inoculationDate, setInoculationDate] = useState(formatDate(new Date()));
    const [numUnits, setNumUnits] = useState('');
    const [unitType, setUnitType] = useState(availableUnitTypes?.[0] || '');
    const [unitWeight, setUnitWeight] = useState('');
    const [substrateRecipe, setSubstrateRecipe] = useState(availableSubstrates?.[0] || '');
    const [spawnSupplier, setSpawnSupplier] = useState(availableSuppliers?.[0] || '');
    const [notes, setNotes] = useState('');
    const [batchLabel, setBatchLabel] = useState('');

    // --- Effects to Reset Selections if Lists Change ---
    useEffect(() => { if (availableVarieties && !availableVarieties.some(v => v.name === variety)) { setVariety(availableVarieties[0]?.name || ''); } }, [availableVarieties, variety]);
    useEffect(() => { if (availableSubstrates && !availableSubstrates.includes(substrateRecipe)) { setSubstrateRecipe(availableSubstrates[0] || ''); } }, [availableSubstrates, substrateRecipe]);
    useEffect(() => { if (availableSuppliers && !availableSuppliers.includes(spawnSupplier)) { setSpawnSupplier(availableSuppliers[0] || ''); } }, [availableSuppliers, spawnSupplier]);
    useEffect(() => { if (availableUnitTypes && !availableUnitTypes.includes(unitType)) { setUnitType(availableUnitTypes[0] || ''); } }, [availableUnitTypes, unitType]);


    // --- Effect to Update Batch Label ---
    useEffect(() => {
        if (!variety || !inoculationDate || !availableVarieties) { setBatchLabel(""); return; }
        try {
            const date = new Date(inoculationDate + 'T00:00:00');
            if (isNaN(date.getTime())) { setBatchLabel("Invalid Date"); return; }
            const abbrev = getAbbreviation(variety, availableVarieties);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            setBatchLabel(`${abbrev}${day}/${month}/${year}`);
        } catch (e) { console.error("Err Label:", e); setBatchLabel("Error"); }
    }, [variety, inoculationDate, availableVarieties]);


    // --- Handle Form Submission ---
    const handleSubmit = (event) => {
        event.preventDefault();
        const units = parseInt(numUnits);
        const weight = parseFloat(unitWeight);

        // Validation - Check all dropdowns/required fields
        if (!variety || !inoculationDate || !units || units <= 0 || !batchLabel || batchLabel === "Error" || batchLabel === "Invalid Date" || !unitType || !unitWeight || weight <= 0 || !substrateRecipe || !spawnSupplier) {
            alert("Please complete all required fields correctly (Variety, Date, Units > 0, Unit Type, Weight > 0, Substrate, Supplier). Ensure label is valid.");
            return;
        }

        // Create New Batch Object
        const newBatch = {
            batchLabel, variety, inoculationDate,
            numBags: units, unitType, unitWeight: weight,
            substrateRecipe, spawnSupplier, contaminatedBags: 0,
            harvests: [], notes, stage: "incubation",
            colonisationCompleteDate: null, growRoomEntryDate: null,
            retirementDate: null
        };

        onAddBatch(newBatch);

        // Clear Form Fields
        setVariety(availableVarieties?.[0]?.name || '');
        setInoculationDate(formatDate(new Date()));
        setNumUnits('');
        setUnitType(availableUnitTypes?.[0] || '');
        setUnitWeight('');
        setSubstrateRecipe(availableSubstrates?.[0] || '');
        setSpawnSupplier(availableSuppliers?.[0] || '');
        setNotes('');
    };

    // --- Tailwind Styles ---
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputBaseStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";
    // --- ADDED BACK: Definition for inputStyle ---
    const inputStyle = `${inputBaseStyle} text-gray-900`;
    const selectStyle = `${inputBaseStyle} text-gray-900`;
    const readOnlyInputStyle = `${inputBaseStyle} bg-gray-100 text-gray-500 cursor-not-allowed`;
    const buttonStyle = "w-full mt-6 p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out text-lg";

    // --- JSX Return ---
    return (
        <div className="flex justify-center py-8 px-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-xl">
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 text-center flex items-center justify-center">
                    <LabIcon /> New Batch
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Variety Dropdown */}
                    <div>
                        <label htmlFor="variety" className={labelStyle}>Variety</label>
                        <select id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} className={selectStyle} required>
                            {availableVarieties && availableVarieties.length > 0 ? ( availableVarieties.map(vObj => <option key={vObj.name} value={vObj.name}>{vObj.name}</option>) ) : (<option value="" disabled>No varieties defined</option>)}
                        </select>
                    </div>

                    {/* Inoculation Date */}
                    <div>
                        <label htmlFor="inoculationDate" className={labelStyle}>Inoculation Date</label>
                         {/* Use inputStyle here */}
                        <input type="date" id="inoculationDate" value={inoculationDate} onChange={(e) => setInoculationDate(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }} required />
                    </div>

                    {/* Number of Units */}
                    <div>
                        <label htmlFor="numUnits" className={labelStyle}>Number of Units</label>
                         {/* Use inputStyle here */}
                        <input type="number" id="numUnits" min="1" value={numUnits} onChange={(e) => setNumUnits(e.target.value)} placeholder="e.g., 10" className={inputStyle} required />
                    </div>

                    {/* Unit Type Dropdown */}
                    <div>
                        <label htmlFor="unitType" className={labelStyle}>Unit Type</label>
                         <select id="unitType" value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectStyle} required>
                            {availableUnitTypes && availableUnitTypes.length > 0 ? ( availableUnitTypes.map(unitTypeName => <option key={unitTypeName} value={unitTypeName} className="capitalize">{unitTypeName}</option>) ) : (<option value="" disabled>No unit types defined</option>)}
                        </select>
                    </div>

                    {/* Unit Weight */}
                    <div>
                        <label htmlFor="unitWeight" className={labelStyle}>Unit Weight (kg)</label>
                         {/* Use inputStyle here */}
                        <input type="number" id="unitWeight" min="0.1" step="0.1" value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)} placeholder="e.g., 2.5" className={inputStyle} required />
                    </div>

                    {/* Substrate Recipe Dropdown */}
                    <div>
                        <label htmlFor="substrateRecipe" className={labelStyle}>Substrate Recipe</label>
                        <select id="substrateRecipe" value={substrateRecipe} onChange={(e) => setSubstrateRecipe(e.target.value)} className={selectStyle} required>
                            {availableSubstrates && availableSubstrates.length > 0 ? ( availableSubstrates.map(substrateName => <option key={substrateName} value={substrateName}>{substrateName}</option>) ) : (<option value="" disabled>No substrates defined</option>)}
                        </select>
                    </div>

                    {/* Spawn Supplier Dropdown */}
                    <div>
                        <label htmlFor="spawnSupplier" className={labelStyle}>Spawn Supplier</label>
                         <select id="spawnSupplier" value={spawnSupplier} onChange={(e) => setSpawnSupplier(e.target.value)} className={selectStyle} required>
                            {availableSuppliers && availableSuppliers.length > 0 ? ( availableSuppliers.map(supplierName => <option key={supplierName} value={supplierName}>{supplierName}</option>) ) : (<option value="" disabled>No suppliers defined</option>)}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className={labelStyle}>Notes (optional)</label>
                         {/* Use inputStyle here for consistency (although inputBaseStyle would also work) */}
                        <textarea id="notes" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific details..." className={inputStyle}></textarea>
                    </div>

                    {/* Batch Label */}
                    <div>
                        <label htmlFor="batchLabel" className={labelStyle}>Batch Label (Auto-generated)</label>
                        <input type="text" id="batchLabel" value={batchLabel} readOnly className={readOnlyInputStyle} />
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

export default LabView;