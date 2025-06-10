// src/components/BatchCard.jsx
import React, { useState } from 'react';
import { formatDate } from '../utils/helpers';

import {
    ArrowRightIcon,
    ArrowLeftIcon,
    TrashIcon,
    PlusIcon,
    ArchiveIcon,
} from './icons';

function BatchCard({ batch, onUpdateBatch, onMoveBatch, onDeleteBatch, onOpenHarvestModal, onOpenMovePartialModal }) {
    const [showHarvests, setShowHarvests] = useState(false);
    const [colonisationDateInput, setColonisationDateInput] = useState(batch?.colonisationCompleteDate || '');
    const [showColonisationInput, setShowColonisationInput] = useState(false);

    const safeBatch = batch || {};

    const handleContaminatedChange = (e) => {
        const contaminated = parseInt(e.target.value) || 0;
        const maxContaminated = safeBatch.numBags || 0;
        onUpdateBatch(safeBatch.id, { contaminatedBags: Math.min(Math.max(0, contaminated), maxContaminated) });
    };

    const handleNotesChange = (e) => {
        onUpdateBatch(safeBatch.id, { notes: e.target.value });
    };

    const handleRemoveHarvest = (index) => {
        if (!Array.isArray(safeBatch.harvests)) return;
        const updatedHarvests = [...safeBatch.harvests];
        updatedHarvests.splice(index, 1);
        onUpdateBatch(safeBatch.id, { harvests: updatedHarvests });
    };

    const handleSetColonisationDate = () => {
        if (colonisationDateInput) {
            if (safeBatch.inoculationDate && new Date(colonisationDateInput) < new Date(safeBatch.inoculationDate)) {
                 alert("Colonisation date cannot be before inoculation date.");
                 return;
            }
            onUpdateBatch(safeBatch.id, { colonisationCompleteDate: formatDate(colonisationDateInput) });
            setShowColonisationInput(false);
        } else {
            alert("Please select a valid date.");
        }
    };

    const totalHarvested = Array.isArray(safeBatch.harvests)
        ? safeBatch.harvests.reduce((sum, h) => sum + (h?.weight || 0), 0).toFixed(2)
        : "0.00";

    const cardBaseStyle = "bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-sm text-gray-700 flex flex-col h-full";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const textareaStyle = `${inputStyle} placeholder-gray-400`;
    const buttonBaseStyle = "flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md border cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryButtonStyle = `${buttonBaseStyle} bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600`;
    const secondaryButtonStyle = `${buttonBaseStyle} bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
    const dangerButtonStyle = `${buttonBaseStyle} bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700`;
    const infoButtonStyle = `${buttonBaseStyle} bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600`;
    const movePartialButtonStyle = `${buttonBaseStyle} bg-teal-500 border-teal-500 text-white hover:bg-teal-600 hover:border-teal-600`;

    return (
        <div className={cardBaseStyle}>
            <div className="flex-grow">
                <strong className="text-base text-orange-600 block mb-1">{safeBatch.batchLabel || 'No Label'}</strong>
                {/* THE ONLY FIX NEEDED: Using ?.name to prevent app crash */}
                <p><span className="font-medium text-gray-500">Variety:</span> {safeBatch.variety?.name || 'N/A'}</p>
                <p><span className="font-medium text-gray-500">Inoculated:</span> {formatDate(safeBatch.inoculationDate)}</p>
                {safeBatch.colonisationCompleteDate && <p><span className="font-medium text-gray-500">Colonised:</span> {formatDate(safeBatch.colonisationCompleteDate)}</p>}
                {safeBatch.stage === 'grow' && safeBatch.growRoomEntryDate && <p><span className="font-medium text-gray-500">Entered Grow:</span> {formatDate(safeBatch.growRoomEntryDate)}</p>}
                {safeBatch.stage === 'retired' && safeBatch.retirementDate && <p><span className="font-medium text-gray-500">Retired:</span> {formatDate(safeBatch.retirementDate)}</p>}
                <p><span className="font-medium text-gray-500">Units:</span> {safeBatch.numBags || 0} x {safeBatch.unitWeight || '?'} kg {safeBatch.unitType || 'units'}</p>
                {safeBatch.stage === 'incubation' && ( <div className="mt-2"> <label className="block text-xs font-medium text-gray-500 mb-1">Contaminated Units:</label> <input type="number" value={safeBatch.contaminatedBags || 0} onChange={handleContaminatedChange} min="0" max={safeBatch.numBags || 0} className={inputStyle}/> </div> )}
                {(safeBatch.stage === 'retired' || safeBatch.stage === 'grow') && ( <p><span className="font-medium text-gray-500">Contaminated:</span> {safeBatch.contaminatedBags || 0} units</p> )}
                <p><span className="font-medium text-gray-500">Substrate:</span> {safeBatch.substrateRecipe || 'N/A'}</p>
                <p><span className="font-medium text-gray-500">Spawn:</span> {safeBatch.spawnSupplier || 'N/A'}</p>
                {(safeBatch.stage === 'incubation' || safeBatch.stage === 'grow') && ( <div className="mt-2"> <label className="block text-xs font-medium text-gray-500 mb-1">Notes:</label> <textarea rows="2" value={safeBatch.notes || ''} onChange={handleNotesChange} className={textareaStyle} placeholder="Add notes..."/> </div> )}
                {safeBatch.stage === 'retired' && ( <p><span className="font-medium text-gray-500">Notes:</span> {safeBatch.notes || '—'}</p> )}
                {(safeBatch.stage === 'grow' || safeBatch.stage === 'retired') && (
                    <div className="mt-2">
                        <p><span className="font-medium text-gray-500">Total Harvested:</span> {totalHarvested} kg</p>
                        {Array.isArray(safeBatch.harvests) && safeBatch.harvests.length > 0 && safeBatch.stage === 'grow' && (
                            <>
                                <button onClick={() => setShowHarvests(!showHarvests)} className={`mt-2 mb-1 px-2 py-1 rounded text-xs border border-gray-300 ${showHarvests ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 text-gray-600`}>
                                    {showHarvests ? 'Hide' : 'Show'} Harvest Entries
                                </button>
                                {showHarvests && (
                                    <div className="mt-1 space-y-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">
                                        {safeBatch.harvests.map((h, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span>{formatDate(h?.date)} - {h?.weight || 0} kg</span>
                                                <button onClick={() => handleRemoveHarvest(i)} className="ml-2 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer text-lg p-0 leading-none" aria-label="Remove harvest entry">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-3 border-t border-gray-200">
                {safeBatch.stage === 'incubation' && !safeBatch.colonisationCompleteDate && (
                    <div className="mb-3">
                        {!showColonisationInput ? ( <button onClick={() => setShowColonisationInput(true)} className={`${infoButtonStyle} w-full`}> Set Colonisation Date </button> ) : ( <div className="flex items-end gap-2"> <div className="flex-grow"> <label className="block text-xs font-medium text-gray-500 mb-1">Colonisation Complete:</label> <input type="date" value={colonisationDateInput} onChange={(e) => setColonisationDateInput(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }}/> </div> <button onClick={handleSetColonisationDate} className={`${primaryButtonStyle} h-[38px]`}> Set </button> <button onClick={() => setShowColonisationInput(false)} className={`${secondaryButtonStyle} h-[38px]`}> Cancel </button> </div> )}
                    </div>
                )}
                <div className="flex flex-wrap gap-2 items-center">
                    {safeBatch.stage === 'incubation' && (
                        <>
                            <button
                                onClick={() => onMoveBatch(safeBatch.id, 'grow')}
                                className={primaryButtonStyle}
                                disabled={!safeBatch.colonisationCompleteDate}
                                title={"Move ALL to Grow Room"}
                            >
                                Move All to Grow <ArrowRightIcon className="ml-1 w-3 h-3"/>
                            </button>
                            {onOpenMovePartialModal && (
                                <button
                                    onClick={() => onOpenMovePartialModal(safeBatch)}
                                    className={movePartialButtonStyle}
                                    title={"Move PARTIAL to Grow Room"}
                                >
                                    Move Partial <ArrowRightIcon className="ml-1 w-3 h-3"/>
                                </button>
                            )}
                            <button
                                onClick={() => onDeleteBatch(safeBatch.id)}
                                className={dangerButtonStyle}
                            >
                                <TrashIcon className="w-3 h-3"/> Delete
                            </button>
                        </>
                    )}
                    {safeBatch.stage === 'grow' && (
                        <>
                            <button onClick={() => onOpenHarvestModal(safeBatch.id)} className={primaryButtonStyle}><PlusIcon className="mr-1 w-3 h-3"/> Log Harvest</button>
                            <button onClick={() => onMoveBatch(safeBatch.id, 'incubation')} className={secondaryButtonStyle}><ArrowLeftIcon className="mr-1 w-3 h-3"/> Back to Incubation</button>
                            <button onClick={() => onMoveBatch(safeBatch.id, 'retired')} className={secondaryButtonStyle}><ArchiveIcon className="mr-1 w-3 h-3"/> Retire Batch</button>
                        </>
                    )}
                    {safeBatch.stage === 'retired' && (
                        <>
                            <button onClick={() => onMoveBatch(safeBatch.id, 'grow')} className={primaryButtonStyle}><ArrowLeftIcon className="mr-1 w-3 h-3"/> Move Back to Grow</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BatchCard;