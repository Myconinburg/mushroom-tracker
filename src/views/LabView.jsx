// src/views/LabView.jsx
import React, { useState, useEffect } from 'react';
import { formatDate, getAbbreviation } from '../utils/helpers';
import { LabIcon } from '../components/icons';

// MERGED: Using the more complete props list from Tobys-Branch
function LabView({
    onAddBatch,
    availableVarieties = [],
    availableSubstrates = [],
    availableSuppliers = [],
    availableUnitTypes = [],
}) {
    // MERGED: Using varietyId from `main` and other form states from `Tobys-Branch`
    const [varietyId, setVarietyId] = useState('');
    const [inoculationDate, setInoculationDate] = useState(formatDate(new Date()));
    const [numUnits, setNumUnits] = useState('');
    const [unitType, setUnitType] = useState(availableUnitTypes?.[0] || 'bag');
    const [unitWeight, setUnitWeight] = useState('');
    const [substrateRecipe, setSubstrateRecipe] = useState(availableSubstrates?.[0] || '');
    const [spawnSupplier, setSpawnSupplier] = useState(availableSuppliers?.[0] || '');
    const [notes, setNotes] = useState('');
    const [batchLabel, setBatchLabel] = useState('');

    // KEPT from `main`: This effect correctly sets the initial variety ID when the list loads.
    useEffect(() => {
        if (availableVarieties.length > 0 && !varietyId) {
            setVarietyId(availableVarieties[0].id.toString());
        }
    }, [availableVarieties, varietyId]);
    
    // MERGED: This effect now uses varietyId to generate the label.
    useEffect(() => {
        const selectedVarietyObj = availableVarieties.find(v => v.id === parseInt(varietyId));
        const varietyNameForLabel = selectedVarietyObj ? selectedVarietyObj.name : '';

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
            // The getAbbreviation function from helpers now needs the full list of varieties
            const abbrev = getAbbreviation(varietyNameForLabel, availableVarieties);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            setBatchLabel(`${abbrev}${day}/${month}/${year}`);
        } catch (e) {
            console.error("Error formatting date for batch label:", e);
            setBatchLabel("Error");
        }
    }, [varietyId, inoculationDate, availableVarieties]);

    // MERGED: The handleSubmit function now sends varietyId and all other form fields.
    const handleSubmit = (event) => {
        event.preventDefault();
        const units = parseInt(numUnits);
        const weight = parseFloat(unitWeight);
        const parsedVarietyId = parseInt(varietyId);

        if (!parsedVarietyId || !inoculationDate || !units || units <= 0 || !batchLabel || batchLabel === "Error" || !unitType || !unitWeight || weight <= 0 || !substrateRecipe || !spawnSupplier) {
            alert("Please complete all required fields correctly.");
            return;
        }

        const newBatch = {
            batchLabel,
            varietyId: parsedVarietyId, // KEPT from `main`: Sending the ID is crucial.
            inoculationDate,
            numBags: units,
            unitType,
            unitWeight: weight,
            substrateRecipe, // Kept from Tobys-Branch
            spawnSupplier,   // Kept from Tobys-Branch
            notes,
            // The stage is set on the backend now, so we don't need to send it.
        };
        
        onAddBatch(newBatch);

        // Clear form after submission
        if (availableVarieties.length > 0) setVarietyId(availableVarieties[0].id.toString());
        setInoculationDate(formatDate(new Date()));
        setNumUnits('');
        setUnitType(availableUnitTypes?.[0] || 'bag');
        setUnitWeight('');
        setSubstrateRecipe(availableSubstrates?.[0] || '');
        setSpawnSupplier(availableSuppliers?.[0] || '');
        setNotes('');
    };
    
    // --- Tailwind Styles from Tobys-Branch ---
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputBaseStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm";
    const inputStyle = `${inputBaseStyle} text-gray-900`;
    const selectStyle = `${inputBaseStyle} text-gray-900`;
    const readOnlyInputStyle = `${inputBaseStyle} bg-gray-100 text-gray-500 cursor-not-allowed`;
    const buttonStyle = "w-full mt-6 p-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out text-lg";
    
    // --- MERGED: JSX using the improved UI from Tobys-Branch but with logic from main ---
    return (
        <div className="flex justify-center py-8 px-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-xl">
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-900 text-center flex items-center justify-center">
                    <LabIcon /> New Batch
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Variety Dropdown - LOGIC FROM MAIN */}
                    <div>
                        <label htmlFor="variety" className={labelStyle}>Variety</label>
                        <select id="variety" value={varietyId} onChange={(e) => setVarietyId(e.target.value)} className={selectStyle} required>
                            <option value="" disabled>Select a variety</option>
                            {availableVarieties.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Inoculation Date */}
                    <div>
                        <label htmlFor="inoculationDate" className={labelStyle}>Inoculation Date</label>
                        <input type="date" id="inoculationDate" value={inoculationDate} onChange={(e) => setInoculationDate(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }} required />
                    </div>

                    {/* Number of Units */}
                    <div>
                        <label htmlFor="numUnits" className={labelStyle}>Number of Units</label>
                        <input type="number" id="numUnits" min="1" value={numUnits} onChange={(e) => setNumUnits(e.target.value)} placeholder="e.g., 10" className={inputStyle} required />
                    </div>

                    {/* Unit Type Dropdown - UI FROM TOBYS-BRANCH */}
                    <div>
                        <label htmlFor="unitType" className={labelStyle}>Unit Type</label>
                         <select id="unitType" value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectStyle} required>
                             {availableUnitTypes.map(unitTypeName => <option key={unitTypeName} value={unitTypeName} className="capitalize">{unitTypeName}</option>)}
                         </select>
                    </div>

                    {/* Unit Weight */}
                    <div>
                        <label htmlFor="unitWeight" className={labelStyle}>Unit Weight (kg)</label>
                        <input type="number" id="unitWeight" min="0.1" step="0.1" value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)} placeholder="e.g., 2.5" className={inputStyle} required />
                    </div>

                    {/* Substrate Recipe Dropdown - UI FROM TOBYS-BRANCH */}
                    <div>
                        <label htmlFor="substrateRecipe" className={labelStyle}>Substrate Recipe</label>
                        <select id="substrateRecipe" value={substrateRecipe} onChange={(e) => setSubstrateRecipe(e.target.value)} className={selectStyle} required>
                           {availableSubstrates.map(substrateName => <option key={substrateName} value={substrateName}>{substrateName}</option>)}
                        </select>
                    </div>

                    {/* Spawn Supplier Dropdown - UI FROM TOBYS-BRANCH */}
                    <div>
                        <label htmlFor="spawnSupplier" className={labelStyle}>Spawn Supplier</label>
                         <select id="spawnSupplier" value={spawnSupplier} onChange={(e) => setSpawnSupplier(e.target.value)} className={selectStyle} required>
                             {availableSuppliers.map(supplierName => <option key={supplierName} value={supplierName}>{supplierName}</option>)}
                         </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className={labelStyle}>Notes (optional)</label>
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